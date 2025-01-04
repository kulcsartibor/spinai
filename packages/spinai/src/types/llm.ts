import { SpinAiContext } from "./context";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMDecision {
  actions: string[];
  isDone: boolean;
  reasoning?: string;
  summary?: string;
  response: string;
}

export interface AgentResponse {
  response: string;
  context: SpinAiContext;
}

export interface BaseLLM {
  createChatCompletion(params: {
    messages: LLMMessage[];
    temperature?: number;
  }): Promise<LLMDecision>;
}

export interface LLMConfig {
  systemPrompt: string;
  temperature?: number;
}
