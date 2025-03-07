import { createAgent } from "spinai";
import * as dotenv from "dotenv";
import { openai } from "@ai-sdk/openai";
import { getMathMcpActions } from "./mcp-helper";

// Load environment variables first
dotenv.config();

async function main() {
  try {
    // Get actions from our math MCP
    console.log("Setting up MCP actions...");
    const mcpActions = await getMathMcpActions();
    console.log(
      "Available actions:",
      mcpActions.map((a) => a.id)
    );

    if (!mcpActions.length) {
      throw new Error("No MCP actions were created!");
    }

    // Create a calculator agent that uses the MCP actions
    const calculatorAgent = createAgent({
      instructions: `You are a calculator agent that helps users perform mathematical calculations using MCP-powered actions.
      Available actions:
      ${mcpActions.map((a) => `- ${a.id}: ${a.description}`).join("\n      ")}
      Remember to follow order of operations (PEMDAS).`,
      actions: mcpActions,
      model: openai("gpt-4o"),
    });

    // Test the agent with different operations
    console.log("\nTesting addition:");
    const addResult = await calculatorAgent({
      input: "What is 5 plus 3?",
    });
    console.log("Addition response:", addResult.response);

    console.log("\nTesting multiplication:");
    const multiplyResult = await calculatorAgent({
      input: "What is 6 times 4?",
    });
    console.log("Multiplication response:", multiplyResult.response);

    console.log("\nTesting power:");
    const powerResult = await calculatorAgent({
      input: "What is 2 to the power of 3?",
    });
    console.log("Power response:", powerResult.response);

    console.log("\nTesting complex expression:");
    const complexResult = await calculatorAgent({
      input: "What is 2 plus 3 times 2?",
    });
    console.log("Complex response:", complexResult.response);
  } catch (error) {
    console.error("Error running calculator agent:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

// Run the test
main().catch(console.error);
