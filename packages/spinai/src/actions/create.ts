import { Action } from "../types/action";
import { SpinAiContext } from "../types/context";

export function createAction(config: {
  id: string;
  description: string;
  run: (context: SpinAiContext) => Promise<SpinAiContext>;
  dependsOn?: string[];
  retries?: number;
}): Action {
  return {
    id: config.id,
    description: config.description,
    run: config.run,
    dependsOn: config.dependsOn || [],
    retries: config.retries || 2,
  };
}
