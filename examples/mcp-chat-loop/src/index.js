import { createAgent, createActionsFromMcpConfig } from "spinai";
import * as dotenv from "dotenv";
import { openai } from "@ai-sdk/openai";
import ora from "ora";
import chalk from "chalk";
// @ts-ignore
import mcpConfig from "../mcp-config.js";
dotenv.config();
async function startChat() {
    // Create actions from MCP configuration
    const spinner = ora("Setting up MCP actions...").start();
    const mcpActions = await createActionsFromMcpConfig(mcpConfig);
    spinner.succeed(chalk.green("Ready to chat!"));
    const agent = createAgent({
        instructions: `You are a GitHub assistant that can help with repository management.
    Use the available GitHub actions to help users with their requests.
    Always respond in a clear and friendly manner.`,
        actions: [...mcpActions],
        model: openai("gpt-4o-mini"),
    });
    console.log("\n" + chalk.cyan.bold("🤖 GitHub Assistant Chat"));
    console.log(chalk.dim('Type "exit" to end the conversation\n'));
    let conversationContext = "";
    let currentInput = "";
    // Set up stdin
    process.stdin.setEncoding("utf8");
    process.stdout.write(chalk.green.bold("You: "));
    process.stdin.on("data", async (data) => {
        const input = data.toString().trim();
        if (input === "exit") {
            console.log(chalk.yellow("\n👋 Chat ended. Goodbye!\n"));
            process.exit(0);
        }
        if (input) {
            try {
                conversationContext += `\nUser: ${input}`;
                const thinkingSpinner = ora({
                    text: chalk.blue("Thinking..."),
                    spinner: "dots12",
                    color: "blue",
                }).start();
                const result = await agent({
                    input: conversationContext,
                });
                thinkingSpinner.stop();
                console.log("\nFull response:", JSON.stringify(result, null, 2), "\n");
                conversationContext += `\nAssistant: ${result.response}`;
                console.log(chalk.blue.bold("\nAssistant: ") + result.response + "\n");
                process.stdout.write(chalk.green.bold("You: "));
            }
            catch (error) {
                console.error(chalk.red("\nError:"), error);
                console.log(chalk.red("Please try again with a different request.\n"));
                process.stdout.write(chalk.green.bold("You: "));
            }
        }
        else {
            process.stdout.write(chalk.green.bold("You: "));
        }
    });
}
// Handle interrupts
process.on("SIGINT", () => {
    console.log(chalk.yellow("\n👋 Chat ended. Goodbye!\n"));
    process.exit(0);
});
startChat().catch((error) => {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
});
