/* eslint-disable @typescript-eslint/no-explicit-any */

import { LanguageModelV1 } from "ai";
import { Action } from "../actions";
import { DebugMode } from "../debug";
import { Messages } from "../messages";

export interface AgentConfig {
  instructions: string;
  model: LanguageModelV1;
  actions: Action[];
  agentId?: string;
  spinApiKey?: string;
}

export interface AgentRunConfig {
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
