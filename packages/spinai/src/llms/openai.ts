import OpenAI from "openai";
import { createResponseSchema } from "./shared";
import type { BaseLLM, LLMDecision } from "../types/llm";

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
}

export function createOpenAILLM(config: OpenAIConfig): BaseLLM {
  const client = new OpenAI({ apiKey: config.apiKey });
  const defaultModel = "gpt-4-turbo-preview";

  return {
    async createChatCompletion({
      messages,
      temperature = 0.7,
      responseFormat,
    }) {
      const schema = createResponseSchema(responseFormat);
      const response = await client.chat.completions.create({
        model: config.model || defaultModel,
        messages,
        temperature,
        functions: [
          {
            name: "make_decision",
            description: "Decide which actions to take next",
            parameters: schema,
          },
        ],
        function_call: { name: "make_decision" },
      });

      const functionCall = response.choices[0].message.function_call;
      if (!functionCall?.arguments) {
        throw new Error("No function call in response");
      }

      return JSON.parse(functionCall.arguments) as LLMDecision;
    },
    modelId: config.model || defaultModel,
  };
}
