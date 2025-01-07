// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent, createOpenAILLM, createAnthropicLLM } from "spinai";
import * as dotenv from "dotenv";
import { getCustomerInfo } from "./actions/getCustomerInfo";
import { getSubscriptionStatus } from "./actions/getSubscriptionStatus";
import { createTicket } from "./actions/createTicket";

dotenv.config();

// OpenAI Example:
// const llm = createOpenAILLM({
//   apiKey: process.env.OPENAI_API_KEY || "",
//   model: "gpt-4o-mini",
// });

// Anthropic Example:
const llm = createAnthropicLLM({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
  model: "claude-3-5-sonnet-20241022",
});

// const supportAgent = createAgent({
//   instructions: `You are a customer support agent.`,
//   actions: [getCustomerInfo, getSubscriptionStatus, createTicket],
//   llm,
// });

//  Example with a formatted response:

interface SupportResponse {
  nextBilling: string;
  subscriptionType: string;
}

const supportAgent = createAgent<SupportResponse>({
  instructions: `You are a customer support agent.`,
  actions: [getCustomerInfo, getSubscriptionStatus, createTicket],
  llm,
  agentId: "abc123",
  spinApiKey: "def456",
  responseFormat: {
    type: "json",
    schema: {
      type: "object",
      properties: {
        nextBilling: { type: "string" },
        subscriptionType: { type: "string" },
      },
      required: ["nextBilling", "subscriptionType"],
    },
  },
});

const { response, sessionId } = await supportAgent({
  input: "What plan am I on?",
  state: {},
  sessionId: "52433d97-e333-4cb1-8d2c-97d8dbd40dfa",
});

console.log(response);
console.log(sessionId);
