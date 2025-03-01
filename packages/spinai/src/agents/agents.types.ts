import { LanguageModelV1 } from "ai";
import { Action } from "../actions";
import { DebugMode } from "../debug";
import { Messages } from "../messages";

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
  model: LanguageModelV1;
  agentId?: string;
  spinApiKey?: string;
  training?: {
    systemInstructions?: string;
    completionInstructions?: string;
  };
  responseFormat?: ResponseFormat;
  debug?: DebugMode;
}

export interface AgentResponse<T = unknown> {
  response: T;
  sessionId: string;
  interactionId: string;
  totalDurationMs: number;
  totalCostCents: number;
  state: Record<string, unknown>;
  messages: Messages;
}
