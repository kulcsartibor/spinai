export interface LogPayload {
  timestamp: string;
  agentId: string;
  sessionId: string;
  type: "decision" | "action" | "error";
  data: unknown;
  spinApiKey: string;
}

export interface AgentRunMetadata {
  sessionId: string;
  decisions: DecisionLog[];
  actions: ActionLog[];
  errors?: ErrorLog[];
}

export interface DecisionLog {
  timestamp: string;
  decision: {
    actions: string[];
    isDone: boolean;
    response: string;
    reasoning?: string;
  };
}

export interface ActionLog {
  timestamp: string;
  actionId: string;
  status: "started" | "completed" | "failed";
  duration?: number;
  error?: string;
}

export interface ErrorLog {
  timestamp: string;
  error: string;
  context?: unknown;
}
