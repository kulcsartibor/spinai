import { openai } from "@ai-sdk/openai";

// this is the LLM all the tests will use - swap this out with different providers to test that they work

export const testLLM = openai("gpt-4o");
