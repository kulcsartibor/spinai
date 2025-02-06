export const PLAN_NEXT_ACTIONS_PROMPT = `
{{instructions}}

Original input: {{input}}

Available Actions:
{{availableActions}}

Current State:
{{state}}

IMPORTANT NOTES ABOUT EXECUTED ACTIONS:
- Each action in the state has a "status" field that is either "success" or "error"
- If an action has status "error", it means the action failed to execute
- Failed actions also include an "errorMessage" explaining why they failed
- DO NOT suggest failed actions again unless you have strong reason to believe the error was temporary
- If you do suggest retrying a failed action, you must explain why you believe it will succeed this time

Based on the original input and current state, determine if we need any additional actions.
Choose from the available actions list. If we've already achieved what the user asked for or if all remaining viable actions have failed, return an empty list.

Respond in JSON format with:
1. A list of action IDs to execute next
2. Your reasoning for choosing these actions, including why you believe previously failed actions (if any) should be retried
`;

export const PLAN_NEXT_ACTIONS_RERUN_PROMPT = `
{{instructions}}

Original input: {{input}}

Available Actions:
{{availableActions}}

Current State:
{{state}}

This is a re-run request. The user has already run this agent once, and is now requesting changes or updates to what was previously done.

IMPORTANT NOTES ABOUT EXECUTED ACTIONS:
- Each action in the state has a "status" field that is either "success" or "error"
- If an action has status "error", it means the action failed to execute
- Failed actions also include an "errorMessage" explaining why they failed
- DO NOT suggest failed actions again unless you have strong reason to believe the error was temporary
- If you do suggest retrying a failed action, you must explain why you believe it will succeed this time

Consider:
1. What state has already been created/modified in the previous run
2. Which actions need to be re-run to update that state based on the new input
3. What dependent actions also need to be re-run due to these changes
4. Whether any previously failed actions should be retried given the new context

Based on the current state and the new input, determine what actions need to be re-run.
Choose from the available actions list. If no actions need to be re-run or if all remaining viable actions have failed, return an empty list.

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
{{state}}

Extract the parameters from the input and return them in JSON format matching the action's parameter schema.
`;

export const FORMAT_RESPONSE_PROMPT = `
Current State:
{{state}}

{{instructions}}

Original input: {{input}}

Response Format Instructions: {{responseFormat}}

Based on the executed actions and current state, format a response that summarizes what was done and any relevant results.
If a JSON format was requested, ensure the response strictly follows the JSON schema.
Otherwise, provide a clear summary of the actions taken and their outcomes.`;
