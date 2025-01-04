import { createAgent, createOpenAILLM } from "spinai";
import * as dotenv from "dotenv";
import { getCustomerInfo } from "./actions/getCustomerInfo";
import { getSubscriptionStatus } from "./actions/getSubscriptionStatus";
import { createTicket } from "./actions/createTicket";

dotenv.config();

const openAi = createOpenAILLM({
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-4o-mini",
});

const supportAgent = createAgent({
  instructions: `You are a customer support agent.`,
  actions: [getCustomerInfo, getSubscriptionStatus, createTicket],
  llm: openAi,
});

const { response } = await supportAgent({
  input: "What plan am I on?",
  state: {},
});
console.log(response);
