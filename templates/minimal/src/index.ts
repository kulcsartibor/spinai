// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent, createOpenAILLM } from "spinai";
import * as dotenv from "dotenv";
import { createAction } from "spinai";
import type { SpinAiContext } from "spinai";
dotenv.config();

const llm = createOpenAILLM({
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-4o-mini",
});

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
  async run(
    context: SpinAiContext,
    parameters?: Record<string, unknown>
  ): Promise<SpinAiContext> {
    const { a, b } = parameters || {};
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error('Parameters "a" and "b" must be numbers');
    }
    const result = a + b;
    context.state.result = result;

    return context;
  },
});

const calculatorAgent = createAgent<number>({
  instructions: `You are a calculator agent that helps users perform mathematical calculations.`,
  actions: [sum],
  llm,
});

async function main() {
  const { response } = await calculatorAgent({
    input: "What is 5 + 10?",
    state: {},
  });

  console.log(response);
}

main().catch(console.error);
