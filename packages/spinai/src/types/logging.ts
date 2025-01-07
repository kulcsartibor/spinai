import { LLMDecision } from "./llm";

export interface BaseLog {
  timestamp: string;
  duration?: number;
}

export interface DecisionLog extends BaseLog {
  type: "decision";
  input: string;
  decision: LLMDecision;
  prompt?: Record<string, unknown>;
}

export interface ActionLog extends BaseLog {
  type: "action";
  actionId: string;
  status: "started" | "completed" | "failed";
  result?: unknown;
  error?: unknown;
}

export interface ErrorLog extends BaseLog {
  type: "error";
  error: unknown;
  context?: unknown;
}

export type LogEntry = DecisionLog | ActionLog | ErrorLog;

export interface LogPayload {
  timestamp: string;
  agentId: string;
  sessionId: string;
  type: "decision" | "action" | "error";
  data: LogEntry;
  spinApiKey: string;
}
