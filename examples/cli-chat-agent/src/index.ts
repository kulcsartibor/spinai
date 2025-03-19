// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent, startCliChat } from "spinai";
import * as dotenv from "dotenv";
import { createAction } from "spinai";
import { openai } from "@ai-sdk/openai";

dotenv.config();

const sum = createAction({
  id: "sum",
  description: "Adds two numbers together.",
  parameters: {
    type: "object",
    properties: {
      a: { type: "number", description: "First number to add" },
      b: { type: "number", description: "Second number to add" },
    },
    required: ["a", "b"],
  },
  async run({ parameters }): Promise<number> {
    const { a, b } = parameters || {};
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error('Parameters "a" and "b" must be numbers');
    }
    const result = a + b;

    return result;
  },
});

async function main() {
  // Create your agent as usual
  const agent = createAgent({
    instructions: `You are a helpful assistant that can answer questions about various topics.
You should be concise and to the point in your responses.`,
    actions: [sum], // Add any actions you want
    model: openai("gpt-4o-mini"), // Use your preferred model
  });

  // Start a CLI chat with the agent
  startCliChat(agent, {
    inputPrompt: "You: ",
    // You can customize other options as needed
  });
}

main().catch(console.error);
