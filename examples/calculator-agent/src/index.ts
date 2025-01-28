// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent, createOpenAILLM, createAnthropicLLM } from "spinai";
import * as dotenv from "dotenv";
import { sum } from "./actions/sum";

dotenv.config();

// OpenAI Example:
const llm = createOpenAILLM({
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-4o-mini",
});

// Anthropic Example:
// const llm = createAnthropicLLM({
//   apiKey: process.env.ANTHROPIC_API_KEY || "",
//   model: "claude-3-5-sonnet-20241022",
// });

const calculatorAgent = createAgent<number>({
  instructions: `You are a calculator agent that helps users perform mathematical calculations.`,
  actions: [sum],
  llm,
});

async function main() {
  const { response } = await calculatorAgent({
    input: "What is 5 plus 3?",
    state: {},
  });

  console.log(response);
}

main().catch(console.error);
