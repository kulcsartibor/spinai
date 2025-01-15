export interface StepLogEntry {
  id: string;
  stepType: "evaluation" | "action_execution";
  timestamp: string;
  sessionId: string;
  context: Record<string, unknown>;
  reasoning?: string;
  actions?: string[];
  status?: "started" | "completed" | "failed";
  durationMs?: number;
  costCents?: number;
  modelUsed?: string;
  errorMessage?: string;
  errorSeverity?: "info" | "warning" | "critical";
  errorContext?: Record<string, unknown>;
  inputTokens?: number;
  outputTokens?: number;
  response?: unknown;
}

export interface InteractionLogEntry {
  id: string;
  sessionId: string;
  inputText: string;
  response?: unknown;
  modelUsed?: string;
  costCents?: number;
  durationMs?: number;
  status?: "success" | "failed";
  errorMessage?: string;
  inputTokens?: number;
  outputTokens?: number;
  timestamp: string;
}

export interface LogPayload {
  timestamp: string;
  agentId: string;
  sessionId: string;
  interactionId: string;
  type: "interaction" | "step";
  data: StepLogEntry | InteractionLogEntry;
  spinApiKey: string;
}
