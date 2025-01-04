import { Action } from "./action";
import { BaseLLM } from "./llm";

export interface AgentConfig {
  instructions: string;
  actions: Action[];
  llm: BaseLLM;
  training?: {
    systemInstructions?: string;
    completionInstructions?: string;
  };
}
