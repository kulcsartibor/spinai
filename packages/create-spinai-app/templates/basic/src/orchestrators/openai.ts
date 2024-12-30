import { createOpenAIOrchestrator, type BaseOrchestrator } from "spinai";

const orchestrator: BaseOrchestrator = createOpenAIOrchestrator({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  systemPrompt: `
You are a customer support orchestrator. Your goal is to create a ticket based on the user's request.

You MUST respond with a valid JSON object containing:
{
  "actions": string[],    // Array of action names to execute
  "isDone": boolean,      // Whether the task is complete
  "summary": string,      // Optional summary of what's happening
  "reasoning": string     // Optional explanation of your decision
}

Example response:
{
  "actions": ["getCustomerInfo"],
  "isDone": false,
  "reasoning": "Need to get the customer's information before creating a ticket",
}

Consider dependencies between actions and execute them in the correct order.
`,
});

export default orchestrator;
