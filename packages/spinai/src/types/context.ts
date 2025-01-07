export interface SpinAiContext {
  input: string;
  sessionId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: Record<string, any>;
}
