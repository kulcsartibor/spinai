/* eslint-disable @typescript-eslint/no-explicit-any */

import { LanguageModelV1 } from "ai";
import { Action } from "../actions";
import { DebugMode } from "../debug";
import { Messages } from "../messages";
import { z } from "zod";

export interface AgentConfig {
  instructions: string;
  model: LanguageModelV1;
  actions: Action[];
  agentId?: string;
  spinApiKey?: string;
  customLoggingEndpoint?: string;
}

export interface AgentRunConfig<TResponseFormat = "text" | z.ZodType<any>> {
  input: string;
  maxSteps?: number;
  sessionId?: string;
  externalCustomerId?: string;
  state?: Record<string, any>;
  isRerun?: boolean;
  actions?: Action[];
  model?: LanguageModelV1;
  debug?: DebugMode;
  agentId?: string;
  spinApiKey?: string;
  responseFormat?: TResponseFormat;
  customLoggingEndpoint?: string;
}

// Helper type to extract the inferred type from a Zod schema
export type InferResponseType<T> =
  T extends z.ZodType<infer U> ? U : T extends "text" ? string : unknown;

export interface AgentResponse<T = unknown> {
  response: T;
  sessionId: string;
  interactionId: string;
  totalDurationMs: number;
  totalCostCents: number;
  state: Record<string, unknown>;
  messages: Messages;
}
