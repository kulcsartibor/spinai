import type { JSONResponseFormat } from "./agent";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMDecision {
  actions: string[];
  isDone: boolean;
  reasoning?: string;
  response: unknown;
  costCents?: number;
  inputTokens?: number;
  outputTokens?: number;
  rawResponse?: unknown;
}

export const DECISION_SCHEMA = {
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
} as const;

export interface BaseLLM {
  createChatCompletion(params: {
    messages: LLMMessage[];
    temperature?: number;
    responseFormat?: JSONResponseFormat;
  }): Promise<LLMDecision>;
  modelId: string;
}

export interface LLMConfig {
  systemPrompt: string;
  temperature?: number;
}
