// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAgent, createAnthropicLLM, createOpenAILLM } from "spinai";
import * as dotenv from "dotenv";
import { createEmailPlan } from "./actions/yash";

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

const calculatorAgent = createAgent<number>({
  instructions: `You are an agent that makes an email plan`,
  actions: [createEmailPlan],
  llm,
  spinApiKey: process.env.SPINAI_API_KEY,
  agentId: "local-calc-test",
});

async function main() {
  const { response } = await calculatorAgent({
    input: "create an email",
    state: {
      promptType: "FOLLOW_UP",
      dealInfo: {
        dealId: "123456",
        dealName: "Enterprise SaaS Solution",
        amount: 50000,
        stage: "Negotiation",
        company: "Acme Corp",
        lastContactDate: "2024-01-15",
      },
      emailHistory: [
        {
          date: "2024-01-10",
          subject: "Initial Proposal",
          from: "sales@ourcompany.com",
          to: "john.doe@acmecorp.com",
          content: "Thank you for your interest in our solution...",
        },
        {
          date: "2024-01-12",
          subject: "Re: Initial Proposal",
          from: "john.doe@acmecorp.com",
          to: "sales@ourcompany.com",
          content: "Thanks for the proposal. We need to discuss pricing...",
        },
      ],
    },
  });

  console.log(response);
}

main().catch(console.error);
