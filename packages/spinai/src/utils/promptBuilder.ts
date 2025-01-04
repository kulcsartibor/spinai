import { Action } from "../types/action";
import { AgentConfig } from "../types/agent";

export function buildSystemPrompt(
  userInstructions: string,
  actions: Action[],
  isComplete?: boolean,
  training?: AgentConfig["training"]
): string {
  if (isComplete) {
    return `${userInstructions}

${
  training?.completionInstructions ||
  `
Review all the actions taken and their results, then provide:
1. A summary of what was accomplished
2. Your reasoning about the process
3. A clear, direct response to the user. If you can't help with their request, be honest and explain why.

Return this in JSON format with "summary", "reasoning", and "response" fields.`
}`;
  }

  const actionDescriptions = actions
    .map((a) => `- ${a.id}: ${a.description}`)
    .join("\n");

  return `${userInstructions}

Available actions:
${actionDescriptions}

${
  training?.systemInstructions ||
  `
You are an AI orchestrator that executes actions in a dependency-aware sequence to achieve the user's goal.

Important: If no actions are relevant to the user's request, you should:
1. Return an empty actions array ([])
2. Be direct and honest about what you cannot do
3. Do not try to answer questions outside the scope of your available actions

For each step:
1. Analyze which actions are needed next
2. Return those actions in your response
3. Wait for the results
4. Decide the next actions based on results

Important rules:
- Return an empty actions array ([]) when the goal is achieved
- Consider dependencies: some actions require others to run first
- You can request multiple actions in one step if they don't depend on each other
- Each action can only run once
- You can ONLY use the actions listed above
- If no actions are relevant, explain that you cannot help with the request

Think step by step about what information you need and what actions to take.`
}`;
}
