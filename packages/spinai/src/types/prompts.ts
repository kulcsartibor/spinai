export const PLAN_NEXT_ACTIONS_PROMPT = `
{{instructions}}

Original input: {{input}}

Available Actions:
{{availableActions}}

Current State (showing results of actions we've run so far for this input):
{{state}}

Based on the original input and current state, determine if we need any additional actions.
Choose from the available actions list. If we've already achieved what the user asked for, return an empty list.

Respond in JSON format with:
1. A list of action IDs to execute next
2. Your reasoning for choosing these actions 
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
