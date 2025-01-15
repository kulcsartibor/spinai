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

// const supportAgent = createAgent({
//   instructions: `You are a customer support agent.`,
//   actions: [getCustomerInfo, getSubscriptionStatus, createTicket],
//   llm,
// });

// Anthropic Example:
// const llm = createAnthropicLLM({
//   apiKey: process.env.ANTHROPIC_API_KEY || "",
//   model: "claude-3-5-sonnet-20241022",
// });

interface SupportResponse {
  nextBilling: string;
  subscriptionType: string;
  name: string;
}

const supportAgent = createAgent<SupportResponse>({
  instructions: `You are a customer support agent.`,
  actions: [getCustomerInfo, getSubscriptionStatus, createTicket],
  llm,
  agentId: "customer-support-test",
  spinApiKey: "QV77-I86L-EMTP-HD9M-Z5VZ-CJTR",
  responseFormat: {
    type: "json",
    schema: {
      type: "object",
      properties: {
        nextBilling: { type: "string" },
        subscriptionType: { type: "string" },
        name: { type: "string" },
      },
      required: ["nextBilling", "subscriptionType", "name"],
    },
  },
});

const { response, sessionId } = await supportAgent({
  input: "What is my name?",
  state: {},
  sessionId: "01ced245-9cae-4ed8-ac94-ff989d92d38c",
});

console.log("agent done running", response, sessionId);
