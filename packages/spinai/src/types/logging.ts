export interface BaseLog {
  id: string; // Unique ID for each step
  sessionId: string; // ID of the session
  timestamp: string; // Time of the log
  stepType: "user_input" | "evaluation" | "action_execution" | "final_response"; // Type of step
}

export interface StepLogEntry extends BaseLog {
  content: Record<string, unknown>; // Input/output for the step
  reasoning?: Record<string, unknown>; // Optional reasoning (for evaluation steps)
  actions?: string[]; // List of actions (for evaluation steps)
  status?: "started" | "completed" | "failed"; // Status (for action steps)
  durationMs?: number; // Duration of the action step (in ms)
  tokenUsage?: Record<string, number>; // Token usage for LLM steps
  costCents?: number; // Cost for this step in cents
  modelUsed?: string; // Model used for the step (e.g., gpt-4)
  errorMessage?: string; // Error message (for failed steps)
  errorSeverity?: "info" | "warning" | "critical"; // Error severity
  errorContext?: Record<string, unknown>; // Context for the error
}

export interface LogPayload {
  timestamp: string;
  agentId: string;
  sessionId: string;
  type: "step"; // Unified log type for steps
  data: StepLogEntry;
  spinApiKey: string;
}
