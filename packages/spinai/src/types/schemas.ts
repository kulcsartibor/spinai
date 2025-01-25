export const PLAN_NEXT_ACTIONS_SCHEMA = {
  type: "object",
  properties: {
    actions: {
      type: "array",
      items: { type: "string" },
      description: "List of action IDs to execute next",
    },
    reasoning: {
      type: "string",
      description:
        "Explanation of why this response was chosen. 400 characters long at most.",
    },
  },
  required: ["actions", "reasoning"],
} as const;

export const ACTION_PARAMETERS_SCHEMA = {
  type: "object",
  properties: {
    parameters: {
      type: "object",
      description: "Parameters for the action",
    },
    reasoning: {
      type: "string",
      description:
        "Explanation of why this response was chosen. 400 characters long at most.",
    },
  },
  required: ["parameters", "reasoning"],
} as const;

export const FORMAT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    response: {
      type: "string",
      description: "The formatted response text",
    },
    reasoning: {
      type: "string",
      description:
        "Explanation of why this response was chosen. 400 characters long at most.",
    },
  },
  required: ["response", "reasoning"],
} as const;

export const DEFAULT_TEXT_RESPONSE_SCHEMA = {
  type: "string",
  description: "A clear summary of the actions taken and their outcomes",
} as const;
