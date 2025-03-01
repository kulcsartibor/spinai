/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpinAiContext } from "../context";

export interface Action {
  id: string;
  description: string;
  parameters?: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  run: (
    context: SpinAiContext,
    parameters?: Record<string, unknown>
  ) => Promise<any>;
  dependsOn?: string[];
  retries?: number;
}

export interface ActionContext {
  input: string;
  state: Record<string, any>;
}
