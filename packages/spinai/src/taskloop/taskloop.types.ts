import { AgentConfig, AgentRunConfig } from "../agents";

export type TaskLoopParams = AgentConfig & AgentRunConfig;

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
