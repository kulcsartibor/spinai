// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent, createAnthropicLLM, createOpenAILLM } from "spinai";
import * as dotenv from "dotenv";
import { randomizeVowels } from "./actions/randomizeVowels";
import { reverseWord } from "./actions/reverseWord";
import { capitalizeWord } from "./actions/capitalizeWord";
import { addExclamation } from "./actions/addExclamation";

dotenv.config();

// OpenAI Example:
// const llm = createOpenAILLM({
//   apiKey: process.env.OPENAI_API_KEY || "",
//   model: "gpt-4o-mini",
// });

const llm = createAnthropicLLM({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
  model: "claude-3-opus-20240229", // Optional
});

// randomizeVowels -> reverseWord -> capitalizeWord -> addExclamation
const testAgent = createAgent<string>({
  instructions: `You are an agent that performs a series of word transformations. 
  Make sure you perform all actions at least once, but plan them one at a time in this order:

  1. addExclamation
  2. capitalizeWord
  3. randomizeVowels
  4. reverseWord
  .
  
  `,
  actions: [addExclamation, randomizeVowels, capitalizeWord, reverseWord],
  llm,
  // debug: "verbose",
  // spinApiKey: process.env.SPINAI_API_KEY,
  agentId: "deps-test-agent",
});

const rerunAgent = createAgent<string>({
  instructions: `You are an agent that performs a series of word transformations. 
  
    This is a linear process and you have to modify the existing email with the new instructions by
    calling (IN THIS EXACT ORDER):

    1. randomizeVowels
    2. reverseWord

    And call each of these ONLY ONCE and finish.

    Only plan one action at a time.
  
  `,
  actions: [addExclamation, randomizeVowels, capitalizeWord, reverseWord],
  llm,
  // debug: "verbose",
  // spinApiKey: process.env.SPINAI_API_KEY,
  agentId: "deps-test-agent",
});

async function main() {
  const { response, state } = await testAgent({
    input: "Piacere",
    state: {},
    sessionId: "abc123",
  });

  console.log({ state });

  const { response: newResponse } = await rerunAgent.rerun({
    input: "Piacere",
    state: {},
    sessionId: "abc123",
  });

  console.log(newResponse);

  console.log("Final result:", response);
}

main().catch(console.error);
