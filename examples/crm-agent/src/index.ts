import { createAgent, createOpenAILLM } from "spinai";
import * as dotenv from "dotenv";
import { updateCustomerInfo } from "./actions/updateCustomerInfo";
import { createFollowUpMeeting } from "./actions/createFollowUpMeeting";
import { createReminder } from "./actions/createReminder";

dotenv.config();

const llm = createOpenAILLM({
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-4o-mini",
});

interface SupportResponse {
  actionItemsTaken: [];
}

const supportAgent = createAgent<SupportResponse>({
  instructions: `You are a customer relationship management agent.`,
  actions: [updateCustomerInfo, createFollowUpMeeting, createReminder],
  llm,
  agentId: "CRM-Demo",
  spinApiKey: "QV77-I86L-EMTP-HD9M-Z5VZ-CJTR",
  responseFormat: {
    type: "json",
    schema: {
      type: "object",
      properties: {
        actionItemsTaken: { type: "array" },
      },
      required: ["actionItemsTaken"],
    },
  },
});

async function main() {
  const { response, sessionId } = await supportAgent({
    input:
      "Sarah (Sales Rep):Hey Mark, thanks for hopping on the call today! Ive reviewed the proposal you sent,\
       and I think it looks great. However, I still need to discuss some technical details with our product team. \
       Could you send me an updated ROI analysis by Friday? Our CFO wants to see the numbers before we proceed \
       Mark (Prospect):No problem, Sarah! I will have our finance team update the ROI calculations. Also, if possible, \
       Id like to schedule a follow-up meeting with your CTO next week to address a few implementation questions.\
       Sarah (Sales Rep):Sure thing. I will coordinate with our CTO and send you a calendar invite for next Tuesday. \
       That way we can walk through any concerns.",
    state: {},
  });

  console.log(response);
}

main();
