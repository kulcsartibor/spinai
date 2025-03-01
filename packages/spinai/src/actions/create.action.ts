/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action } from "./actions.types";
import { SpinAiContext } from "../context/context.types";

export function createAction(config: {
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
}): Action {
  return {
    id: config.id,
    description: config.description,
    parameters: config.parameters,
    run: config.run,
    dependsOn: config.dependsOn || [],
    retries: config.retries || 2,
  };
}
