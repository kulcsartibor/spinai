import { Action } from "./action";

/**
 * Result from the planner deciding what action(s) to take next
 */
export interface PlanningDecision {
  /**
   * Whether we should return to the user (no more actions needed)
   */
  shouldReturn: boolean;

  /**
   * The next action to execute, if any
   * We'll plan one action at a time since next actions may depend on previous results
   */
  nextAction?: {
    id: string;
    reasoning: string;
  };
}

/**
 * Schema for the planning decision
 */
export const PLANNING_SCHEMA = {
  type: "object",
  properties: {
    shouldReturn: {
      type: "boolean",
      description:
        "Whether we should return to the user (no more actions needed)",
    },
    nextAction: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the next action to execute",
        },
        reasoning: {
          type: "string",
          description: "Explanation of why this action was chosen",
        },
      },
      required: ["id", "reasoning"],
    },
  },
  required: ["shouldReturn"],
} as const;

/**
 * Parameters determined for running an action
 */
export interface ActionParameters {
  parameters: Record<string, unknown>;
  reasoning: string;
}

/**
 * Schema for action parameters, dynamically created based on action's parameter schema
 */
export function createActionParametersSchema(action: Action) {
  return {
    type: "object",
    properties: {
      parameters: action.parameters || { type: "object", properties: {} },
      reasoning: {
        type: "string",
        description: "Explanation of why these parameters were chosen",
      },
    },
    required: ["parameters", "reasoning"],
  } as const;
}

/**
 * Final response to return to the user
 */
export interface FinalResponse {
  response: unknown;
  reasoning: string;
}

/**
 * Schema for the final response, dynamically created based on desired response format
 */
export function createFinalResponseSchema(responseFormat?: {
  type: "json";
  schema: Record<string, unknown>;
}) {
  return {
    type: "object",
    properties: {
      response:
        responseFormat?.type === "json"
          ? responseFormat.schema
          : { type: "string" },
      reasoning: {
        type: "string",
        description: "Explanation of the final response",
      },
    },
    required: ["response", "reasoning"],
  } as const;
}
