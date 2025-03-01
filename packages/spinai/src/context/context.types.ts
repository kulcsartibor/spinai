/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SpinAiContext {
  input: string;
  maxSteps?: number;
  sessionId?: string;
  interactionId?: string;
  externalCustomerId?: string;
  state?: Record<string, any>;
  isRerun?: boolean;
}
