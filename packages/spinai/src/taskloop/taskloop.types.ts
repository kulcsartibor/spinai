import type { Action } from "../actions";
import type { SpinAiContext } from "../context/context.types";
import type { AgentConfig, ResponseFormat } from "../agents";
import { DebugMode } from "../debug/debug.types";
import { LanguageModelV1 } from "ai";

export interface TaskLoopParams {
  actions: Action[];
  context: SpinAiContext;
  model: LanguageModelV1;
  instructions: string;
  training?: AgentConfig["training"];
  responseFormat?: ResponseFormat;
  agentId?: string;
  spinApiKey?: string;
  debug?: DebugMode;
  maxSteps?: number;
}

export interface ExecutedAction {
  id: string;
  parameters?: Record<string, unknown>;
  result?: unknown;
  status: "success" | "error";
  errorMessage?: string;
}

export interface RunState {
  input: string;
  [key: string]: unknown;
}
