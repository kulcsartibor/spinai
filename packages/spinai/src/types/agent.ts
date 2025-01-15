import { Action } from "./action";
import { BaseLLM } from "./llm";

export interface JSONResponseFormat {
  type: "json";
  schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export type ResponseFormat = { type: "text" } | JSONResponseFormat;

export interface AgentConfig {
  instructions: string;
  actions: Action[];
  llm: BaseLLM;
  agentId?: string;
  spinApiKey?: string;
  training?: {
    systemInstructions?: string;
    completionInstructions?: string;
  };
  responseFormat?: ResponseFormat;
  debug?: boolean;
}

export interface AgentResponse<T = unknown> {
  response: T;
  sessionId: string;
  totalDurationMs: number;
  totalCostCents: number;
}
