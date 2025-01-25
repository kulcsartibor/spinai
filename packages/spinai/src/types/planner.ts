import { LLM } from "../llms/base";
import { Action } from "./action";
import { ResponseFormat } from "./agent";

export interface PlanNextActionsResult {
  actions: string[];
  reasoning: string;
}

export interface ActionParametersResult {
  parameters: Record<string, unknown>;
  reasoning: string;
}

export interface FormatResponseResult {
  response: unknown;
  reasoning: string;
}

export interface ActionPlannerState {
  input: string;
  context: Record<string, unknown>;
  executedActions: string[];
}

export interface ActionPlanner {
  planNextActions(params: {
    llm: LLM;
    input: string;
    state: ActionPlannerState;
    availableActions: Action[];
  }): Promise<PlanNextActionsResult>;

  getActionParameters(params: {
    llm: LLM;
    action: string;
    input: string;
    state: ActionPlannerState;
    availableActions: Action[];
  }): Promise<ActionParametersResult>;

  formatResponse(params: {
    llm: LLM;
    input: string;
    state: ActionPlannerState;
    responseFormat?: ResponseFormat;
  }): Promise<FormatResponseResult>;

  getTotalCost(): number;
  resetCost(): void;
}

export interface ActionPlannerConstructor {
  new (loggingService?: any, instructions?: string): ActionPlanner;
}
