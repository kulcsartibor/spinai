// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent, createActionsFromMcpConfig } from "spinai";
import * as dotenv from "dotenv";
import { openai } from "@ai-sdk/openai";
import mcpConfig from "../mcp-config";

dotenv.config();

async function main() {
  // Create actions from MCP configuration
  console.log("Setting up MCP actions...");
  const mcpActions = await createActionsFromMcpConfig({
    config: mcpConfig,
  });

  const agent = createAgent({
    instructions: `You are a bot that can answer questions about SpinAI, a typescript open source agent framework from their documentation.`,
    actions: [...mcpActions],
    model: openai("gpt-4o"),
  });

  const { response } = await agent({
    input: "What parameters can you pass into the agent when creating it",
  });

  console.log("Response:", response);
}

main().catch(console.error);
