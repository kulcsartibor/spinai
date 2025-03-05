// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent } from "spinai";
import * as dotenv from "dotenv";
import { sum } from "./actions/sum";
import { minus } from "./actions/minus";
import { openai } from "@ai-sdk/openai";

dotenv.config();

const calculatorAgent = createAgent({
  instructions: `You are a calculator agent that helps users perform mathematical calculations.`,
  actions: [sum, minus],
  model: openai("gpt-4o"),
});

async function main() {
  const { response } = await calculatorAgent({
    input: "What is 5 plus 3 - 1?",
  });

  console.log(response);
}

main().catch(console.error);
