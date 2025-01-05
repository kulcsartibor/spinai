import { LLMMessage } from "../types/llm";

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

export const DEFAULT_SCHEMA = {
  type: "object",
  properties: {
    actions: {
      type: "array",
      items: { type: "string" },
      description: "Array of action IDs to execute",
    },
    isDone: {
      type: "boolean",
      description: "Whether the task is complete",
    },
    response: {
      type: "string",
      description: "Response to the user",
    },
    reasoning: {
      type: "string",
      description: "Optional explanation of decision",
    },
  },
  required: ["actions", "isDone", "response"],
};
