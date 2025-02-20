export const PLAN_NEXT_ACTIONS_PROMPT = `
{{instructions}}

Original input: {{input}}

Current State:
{{state.context}}

Available Actions:
{{availableActions}}


Please respect the order of the actions if they contain another action in their dependencies array. If one action depends on another, 
the dependent action must be executed after the action it depends on.

---
### Actions you've already executed
{{state.executedActions}}

IMPORTANT NOTES ABOUT EXECUTED ACTIONS:
- Each action in the state has a "status" field that is either "success" or "error"
- If an action has status "error", it means the action failed to execute
- Failed actions also include an "errorMessage" explaining why they failed
- DO NOT suggest failed actions again unless you have strong reason to believe the error was temporary
- If you do suggest retrying a failed action, you must explain why you believe it will succeed this time. If it has failed too many times, don't worry about running it or anything that depends on it, just move on if you can.

Based on the original input and current state, determine if we need any additional actions.
Only if it makes sense, choose from the available actions list.
If we've already achieved what the user asked for or if all remaining viable actions have failed, return an empty list.

Respond in JSON format with:
1. A list of action IDs to execute next
2. Your reasoning for choosing these actions, including why you believe previously failed actions (if any) should be retried
`;

export const PLAN_NEXT_ACTIONS_RERUN_PROMPT = `
{{instructions}}

You are an agent that executes a series of actions based on user input and requirements. This is a new interaction based off a
previously run interaction that the user requested a rerun of.

NOTE: That was the user's request specifically in reference to previousInteractionsActions. If you already have executedActions, it means you've probably solved their issue already.

Current Context State:
{{state.context}}


---
### Available Actions
{{availableActions}}

Please respect the order of the actions if they contain another action in their dependencies array. If one action depends on another, 
the dependent action must be executed after the action it depends on.

---
### Execution History
Previous Run (Original Execution, previousInteractionsActions):
{{state.previousInteractionsActions}}


Current Re-run Progress actions you've already executed (executedActions):
{{state.executedActions}}

Here is why the user ran the rerun:
Input: {{input}}

Make youre decision of what to execute next based on the previous run and the current context state, and please keep in mind what you've already rerun this interaction (executedActions).

If you've already rerun sufficient actions, you can return an empty list, which will denote that the rerun is complete.

IMPORTANT NOTES ABOUT EXECUTED ACTIONS:
- Each action in the state has a "status" field that is either "success" or "error"
- If an action has status "error", it means the action failed to execute
- Failed actions also include an "errorMessage" explaining why they failed
- DO NOT suggest failed actions again unless you have strong reason to believe the error was temporary
- If you do suggest retrying a failed action, you must explain why you believe it will succeed this time. If it has failed too many times, don't worry about running it or anything that depends on it, just move on if you can.
---
Respond in JSON format with:
1. A list of action IDs to execute next
2. Your reasoning for choosing these actions, including why you believe previously failed actions (if any) should be retried
`;

export const GET_ACTION_PARAMETERS_PROMPT = `
Action to Execute: {{action}}
Action Description: {{actionDescription}}
Required Parameters Schema:
{{parameterSchema}}

{{instructions}}

Original input: {{input}}

Current State:
{{plannerState}}

Extract the parameters from the input and return them in JSON format matching the action's parameter schema.
`;

export const FORMAT_RESPONSE_PROMPT = `
Current State:
{{plannerState}}

{{instructions}}

Original input: {{input}}

Response Format Instructions: {{responseFormat}}

Based on the executed actions and current state, format a response that summarizes what was done and any relevant results.
If a JSON format was requested, ensure the response strictly follows the JSON schema.
Otherwise, provide a clear summary of the actions taken and their outcomes.`;
