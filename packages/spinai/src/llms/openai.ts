import OpenAI from "openai";
import type { BaseLLM, LLMDecision } from "../types/llm";
import { DEFAULT_SCHEMA } from "./shared";

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
}

const DECISION_FUNCTION = {
  name: "make_decision",
  description: "Decide which actions to take next",
  parameters: DEFAULT_SCHEMA,
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
