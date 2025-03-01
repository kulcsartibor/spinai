import { AgentConfig, AgentRunConfig } from "./agents.types";
import { runTaskLoop } from "../taskloop";

export function createAgent<T = string>(config: AgentConfig) {
  const agent = async function agent(runConfig: AgentRunConfig) {
    return runTaskLoop<T>({
      ...config,
      ...runConfig,
    });
  };

  return agent;
}
