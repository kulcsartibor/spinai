export interface LoggingConfig {
  agentId?: string;
  spinApiKey?: string;
  sessionId: string;
  interactionId: string;
  modelId: string;
  modelProvider?: string;
  externalCustomerId?: string;
  loggingEndpoint?: string;
  isRerun?: boolean;
  input: string;
  initialState?: Record<string, unknown>;
}
