import OpenAI from "openai";
import { calculateCost } from "../utils/tokenCounter";
import { LLM, CompletionOptions, CompletionResult } from "./base";

export interface xAIConfig {
  apiKey: string;
  model?: string;
}

export function createXAILLM(config: xAIConfig): LLM {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: "https://api.x.ai/v1",
  });

  const defaultModel = "grok-2-1212";
  const model = config.model || defaultModel;

  return {
    modelName: model,
    async complete<T>({
      prompt,
      schema,
      temperature,
      maxTokens,
    }: CompletionOptions): Promise<CompletionResult<T>> {
      try {
        const payload: any = {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: temperature ?? 0.7,
          max_tokens: maxTokens,
        };

        if (schema) {
          payload.response_format = { type: "json_object" };
          payload.functions = [
            {
              name: "format_response",
              description: "Format the response according to schema",
              parameters: schema,
            },
          ];
          payload.function_call = { name: "format_response" };
        }

        console.debug("xAI payload:", payload);

        const response = await client.chat.completions.create(payload);

        console.debug("xAI response:", response);

        const choice = response.choices[0];
        let content: T;
        let rawOutput: string;

        if (schema) {
          const functionCall = choice.message.function_call;
          if (!functionCall?.arguments) {
            console.error(
              "xAI response does not include function_call.arguments",
              choice
            );
            throw new Error("Expected function call response from xAI");
          }
          try {
            content = JSON.parse(functionCall.arguments);
          } catch (err) {
            console.error(
              "Error parsing function_call.arguments as JSON:",
              functionCall.arguments
            );
            throw new Error("Invalid JSON in function_call.arguments");
          }
          rawOutput = functionCall.arguments;
        } else {
          content = choice.message.content as T;
          rawOutput = choice.message.content || "";
        }

        let promptTokens = 0;
        let completionTokens = 0;
        if (response.usage) {
          promptTokens = response.usage.prompt_tokens;
          completionTokens = response.usage.completion_tokens;
        } else {
          console.warn(
            "xAI response is missing usage data. Using fallback token counts of 0."
          );
        }

        return {
          content,
          inputTokens: promptTokens,
          outputTokens: completionTokens,
          costCents: calculateCost(promptTokens, completionTokens, model),
          rawInput: prompt,
          rawOutput,
        };
      } catch (error) {
        console.error("Error during xAI completion:", error);
        throw error;
      }
    },
  };
}
