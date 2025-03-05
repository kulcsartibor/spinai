// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent } from "spinai";
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

const calculatorAgent = createAgent({
  instructions: `You are a calculator agent that helps users perform mathematical calculations.`,
  actions: [sum],
  model: openai("gpt-4o"),
});

async function main() {
  const { response } = await calculatorAgent({
    input: "What is 5 + 10?",
  });

  console.log(response);
}

main().catch(console.error);
