import OpenAI from "openai";
import type { BaseLLM, LLMDecision } from "../types/llm";

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
}

const DECISION_FUNCTION = {
  name: "make_decision",
  description: "Decide which actions to take next",
  parameters: {
    type: "object",
    required: ["actions", "isDone", "response"],
    properties: {
      actions: {
        type: "array",
        items: { type: "string" },
        description: "Array of action IDs to execute next",
      },
      isDone: {
        type: "boolean",
        description: "Whether all required actions are complete",
      },
      reasoning: {
        type: "string",
        description: "Explanation of the decision",
      },
      summary: {
        type: "string",
        description: "Summary of progress",
      },
      response: {
        type: "string",
        description: "Direct response to the user's request",
      },
    },
  },
} as const;

export function createOpenAILLM(config: OpenAIConfig): BaseLLM {
  const client = new OpenAI({ apiKey: config.apiKey });

  return {
    async createChatCompletion({ messages, temperature = 0.7 }) {
      const response = await client.chat.completions.create({
        model: config.model || "gpt-4-turbo-preview",
        messages,
        temperature,
        functions: [DECISION_FUNCTION],
        function_call: { name: "make_decision" },
      });

      const functionCall = response.choices[0].message.function_call;
      if (!functionCall?.arguments) {
        throw new Error("No function call in response");
      }

      return JSON.parse(functionCall.arguments) as LLMDecision;
    },
  };
}
