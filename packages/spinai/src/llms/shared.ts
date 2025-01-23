import { LLMMessage } from "../types/llm";
import { DECISION_SCHEMA } from "../types/llm";
import type { ResponseFormat } from "../types/agent";

export const SYSTEM_INSTRUCTIONS = `You are an AI orchestrator that executes actions to achieve goals.

Analyze the user's request and available actions to determine the next steps.
Only use actions that are explicitly provided.`;

export function formatMessages(messages: LLMMessage[]) {
  return messages.map((msg) => ({
    role:
      msg.role === "system" ? "assistant" : (msg.role as "assistant" | "user"),
    content: msg.content,
  }));
}

export function normalizeActions(actions: unknown[]): string[] {
  return actions.map((action) => {
    if (typeof action === "string") return action;
    if (typeof action === "object" && action !== null) {
      const obj = action as Record<string, unknown>;
      if ("action" in obj) return String(obj.action);
      if ("actionID" in obj) return String(obj.actionID);
      if ("action_id" in obj) return String(obj.action_id);
      if ("actionId" in obj) return String(obj.actionId);
      if ("ActionId" in obj) return String(obj.ActionId);
      if ("ActionID" in obj) return String(obj.ActionID);
      if ("Action_ID" in obj) return String(obj.Action_ID);
      if ("Action_Id" in obj) return String(obj.Action_Id);
      if ("id" in obj) return String(obj.id);
      console.warn("Unexpected action format:", action);
    }
    throw new Error(`Invalid action format: ${JSON.stringify(action)}`);
  });
}

export function createResponseSchema(responseFormat?: ResponseFormat) {
  return {
    ...DECISION_SCHEMA,
    properties: {
      ...DECISION_SCHEMA.properties,
      response:
        responseFormat?.type === "json"
          ? {
              type: "object",
              required: responseFormat.schema.required,
              properties: responseFormat.schema.properties,
            }
          : DECISION_SCHEMA.properties.response,
    },
  };
}
