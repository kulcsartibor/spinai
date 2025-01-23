import OpenAI from "openai";
import { createResponseSchema, normalizeActions } from "./shared";
import type { BaseLLM, LLMDecision } from "../types/llm";
import { calculateCost } from "../utils/tokenCounter";

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
      const model = config.model || defaultModel;
      const schema = createResponseSchema(responseFormat);

      const response = await client.chat.completions.create({
        model,
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

      if (!response.usage) {
        throw new Error("No usage data in OpenAI response");
      }

      const inputTokens = response.usage.prompt_tokens;
      const outputTokens = response.usage.completion_tokens;
      const costCents = calculateCost(inputTokens, outputTokens, model);

      const decision = JSON.parse(functionCall.arguments) as LLMDecision;

      return {
        ...decision,
        actions: normalizeActions(decision.actions),
        inputTokens,
        outputTokens,
        costCents,
        rawResponse: response,
      };
    },
    modelId: config.model || defaultModel,
  };
}
