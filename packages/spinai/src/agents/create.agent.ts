import { AgentConfig } from "./agents.types";
import { SpinAiContext } from "../context/context.types";
import { runTaskLoop } from "../taskloop";

export function createAgent<T = string>(config: AgentConfig) {
  const agent = async function agent(context: SpinAiContext) {
    return runTaskLoop<T>({
      context,
      maxSteps: context.maxSteps,
      actions: config.actions,
      model: config.model,
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
      state: context.state || {},
      isRerun: true,
    });
  };

  return agent;
}
