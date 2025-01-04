import { AgentConfig } from "../types/agent";
import { SpinAiContext } from "../types/context";
import { runTaskLoop } from "../utils/taskLoop";

export function createAgent(config: AgentConfig) {
  return async function agent(context: SpinAiContext) {
    return runTaskLoop({
      actions: config.actions,
      context,
      model: config.llm,
      instructions: config.instructions,
      training: config.training,
    });
  };
}
