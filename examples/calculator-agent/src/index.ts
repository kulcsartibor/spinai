// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as dotenv from "dotenv";
import { openai } from "@ai-sdk/openai";
import { sum } from "./actions/sum";
import { minus } from "./actions/minus";
import { divide } from "./actions/divide";
import { multiply } from "./actions/multiply";
import { createAgent } from "spinai";

dotenv.config();

const calculatorAgent = createAgent<number>({
  instructions: `You are a calculator agent that helps users perform mathematical calculations.
ONLY PLAN ONE ACTION AT A TIME..`,
  actions: [sum, minus, multiply, divide],
  model: openai("gpt-4o"),
  // debug: "all",
  spinApiKey: process.env.SPINAI_API_KEY,
  agentId: "local-calc-test",
});

async function main() {
  const { response } = await calculatorAgent({
    input: "What is 5 plus 3 minus 1 plus 8?",
  });

  console.log(response);
}

main().catch(console.error);
