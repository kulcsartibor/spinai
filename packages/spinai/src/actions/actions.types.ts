/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaskLoopParams } from "../taskloop";

export interface Action {
  id: string;
  description: string;
  parameters?: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  run: (params: {
    context: TaskLoopParams;
    parameters?: Record<string, unknown>;
  }) => Promise<any>;
  dependsOn?: string[];
  retries?: number;
}

export interface ActionContext {
  input: string;
  state: Record<string, any>;
}
