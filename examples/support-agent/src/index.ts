// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent, createOpenAILLM, createAnthropicLLM } from "spinai";
import * as dotenv from "dotenv";
import { getCustomerInfo } from "./actions/getCustomerInfo";
import { getSubscriptionStatus } from "./actions/getSubscriptionStatus";
import { createTicket } from "./actions/createTicket";

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

const supportAgent = createAgent({
  instructions: `You are a customer support agent.`,
  actions: [getCustomerInfo, getSubscriptionStatus, createTicket],
  llm,
});

const { response } = await supportAgent({
  input: "What plan am I on?",
  state: {},
});
console.log(response);
