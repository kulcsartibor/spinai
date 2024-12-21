export interface OrchestratorMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OrchestratorDecision {
  actions: string[];
  isDone: boolean;
  summary?: string;
  reasoning?: string;
}

export interface BaseOrchestrator {
  initialize(): Promise<void>;
  decide(messages: OrchestratorMessage[]): Promise<OrchestratorDecision>;
  systemPrompt: string;
}

export interface OrchestratorConfig {
  systemPrompt: string;
  promptTemplate?: string;
  logLevel?: "debug" | "info" | "error";
}
