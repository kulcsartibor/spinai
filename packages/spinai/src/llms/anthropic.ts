import Anthropic from "@anthropic-ai/sdk";
import { type BaseLLM, type LLMDecision } from "../types/llm";
import {
  SYSTEM_INSTRUCTIONS,
  formatMessages,
  createResponseSchema,
} from "./shared";
import { calculateCost } from "../utils/tokenCounter";

export function createAnthropicLLM(config: {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): BaseLLM {
  const anthropic = new Anthropic({
    apiKey: config.apiKey,
  });

  const defaultModel = "claude-3-opus-20240229";
  return {
    async createChatCompletion({
      messages,
      temperature = 0.7,
      responseFormat,
    }) {
      const model = config.model || defaultModel;
      const schema = createResponseSchema(responseFormat);
      const response = await anthropic.messages.create({
        model,
        messages: formatMessages(messages),
        temperature,
        system: `${SYSTEM_INSTRUCTIONS}\n\nRespond only with a JSON object matching this schema:\n${JSON.stringify(schema, null, 2)}`,
        max_tokens: config.maxTokens || 1024,
      });

      if (response.content[0].type !== "text") {
        throw new Error("Expected text response from Claude");
      }

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const costCents = calculateCost(inputTokens, outputTokens, model);
      const decision = JSON.parse(response.content[0].text) as LLMDecision;
      return {
        ...decision,
        outputTokens,
        inputTokens,
        costCents,
        rawResponse: response,
      };
    },
    modelId: config.model || defaultModel,
  };
}
