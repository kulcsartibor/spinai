import OpenAI from "openai";
import type {
  BaseOrchestrator,
  OrchestratorMessage,
  OrchestratorDecision,
} from "../types/orchestrator.js";

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  systemPrompt: string;
}

export function createOpenAIOrchestrator(
  config: OpenAIConfig
): BaseOrchestrator {
  const client = new OpenAI({ apiKey: config.apiKey });
  const orchestratorConfig = {
    model: "gpt-4-turbo-preview",
    temperature: 0.7,
    ...config,
  };

  return {
    async initialize(): Promise<void> {
      // OpenAI doesn't need initialization
    },

    async decide(
      messages: OrchestratorMessage[]
    ): Promise<OrchestratorDecision> {
      const completion = await client.chat.completions.create({
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        model: orchestratorConfig.model,
        temperature: orchestratorConfig.temperature,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No response from orchestrator");

      try {
        return JSON.parse(content) as OrchestratorDecision;
      } catch (e) {
        throw new Error("Invalid orchestrator response format");
      }
    },

    get systemPrompt() {
      return orchestratorConfig.systemPrompt;
    },
  };
}
