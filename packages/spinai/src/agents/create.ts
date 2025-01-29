import { AgentConfig } from "../types/agent";
import { SpinAiContext } from "../types/context";
import { runTaskLoop } from "../utils/taskLoop";

export function createAgent<T = string>(config: AgentConfig) {
  const agent = async function agent(context: SpinAiContext) {
    return runTaskLoop<T>({
      actions: config.actions,
      context,
      model: config.llm,
      instructions: config.instructions,
      training: config.training,
      responseFormat: config.responseFormat,
      agentId: config.agentId,
      spinApiKey: config.spinApiKey,
      debug: config.debug,
    });
  };

  agent.rerun = async function rerun(
    context: SpinAiContext & { sessionId: string }
  ) {
    return agent({
      ...context,
      isRerun: true,
    });
  };

  return agent;
}
