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
