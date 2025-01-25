import { Action } from "../types/action";
import { SpinAiContext } from "../types/context";

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
  ) => Promise<SpinAiContext>;
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
