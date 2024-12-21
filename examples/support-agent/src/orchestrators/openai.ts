import { createOpenAIOrchestrator, type BaseOrchestrator } from "@repo/spinup";

const orchestrator: BaseOrchestrator = createOpenAIOrchestrator({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  systemPrompt: `
You are a customer support orchestrator. Your goal is to help customers by executing 
the appropriate actions in the right order.

You MUST respond with a valid JSON object containing:
{
  "actions": string[],    // Array of action names to execute
  "isDone": boolean,      // Whether the task is complete
  "summary": string,      // Optional summary of what's happening
  "reasoning": string     // Optional explanation of your decision
}

Example response:
{
  "actions": ["getCustomerInfo", "getSubscriptionStatus"],
  "isDone": false,
  "reasoning": "Need to check customer status before proceeding"
}

Consider dependencies between actions and execute them in the correct order.
`,
});

export default orchestrator;
