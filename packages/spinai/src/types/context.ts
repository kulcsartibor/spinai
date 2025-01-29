export interface SpinAiContext {
  input: string;
  sessionId?: string;
  interactionId?: string;
  externalCustomerId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: Record<string, any>;
  isRerun?: boolean;
}
