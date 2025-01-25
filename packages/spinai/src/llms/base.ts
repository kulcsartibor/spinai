export interface CompletionUsage {
  inputTokens: number;
  outputTokens: number;
  costCents: number;
}

export interface CompletionResult<T = unknown> extends CompletionUsage {
  content: T;
}

export interface CompletionOptions {
  prompt: string;
  schema?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface LLM {
  readonly modelName: string;
  complete<T = unknown>(
    options: CompletionOptions
  ): Promise<CompletionResult<T>>;
}
