import Anthropic from "@anthropic-ai/sdk";
import { LLM, CompletionOptions, CompletionResult } from "./base";
import { calculateCost } from "../utils/tokenCounter";

export interface AnthropicConfig {
  apiKey: string;
  model?: string;
}

export function createAnthropicLLM(config: AnthropicConfig): LLM {
  if (!config.apiKey) {
    throw new Error(
      "Anthropic API key is required. Please set ANTHROPIC_API_KEY in your environment variables."
    );
  }

  const anthropic = new Anthropic({
    apiKey: config.apiKey,
  });

  const defaultModel = "claude-3-opus-20240229";
  const model = config.model || defaultModel;

  return {
    modelName: model,
    async complete<T>({
      prompt,
      schema,
      temperature,
      maxTokens,
    }: CompletionOptions): Promise<CompletionResult<T>> {
      const response = await anthropic.messages.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens || 1024,
        ...(schema && {
          system: `Respond only with a JSON object matching this schema:\n${JSON.stringify(schema, null, 2)}`,
        }),
      });

      if (response.content[0].type !== "text") {
        throw new Error("Expected text response from Claude");
      }

      let content: T = response.content[0].text as T;
      if (schema) {
        content = JSON.parse(content as unknown as string);
      }

      return {
        content,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        costCents: calculateCost(
          response.usage.input_tokens,
          response.usage.output_tokens,
          model
        ),
      };
    },
  };
}
