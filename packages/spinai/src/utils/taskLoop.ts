import type { Action } from "../types/action";
import type { SpinAiContext } from "../types/context";
import {
  type LLMMessage,
  type LLMDecision,
  type BaseLLM,
  type AgentResponse,
} from "../types/llm";
import { resolveDependencies } from "./deps";
import { buildSystemPrompt } from "./promptBuilder";
import { log } from "./logger";
import type { AgentConfig, ResponseFormat } from "../types/agent";

async function getNextDecision(
  model: BaseLLM,
  instructions: string,
  input: string,
  actions: Action[],
  previousResults?: unknown,
  isComplete?: boolean,
  training?: AgentConfig["training"],
  responseFormat?: ResponseFormat
): Promise<LLMDecision> {
  const messages: LLMMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt(instructions, actions, isComplete, training),
    },
    { role: "user", content: input },
  ];

  if (previousResults) {
    messages.push({
      role: "user",
      content: `Previous action results: ${JSON.stringify(previousResults, null, 2)}`,
    });
  }

  const decision = await model.createChatCompletion({
    messages,
    temperature: 0.7,
    responseFormat:
      isComplete && responseFormat?.type === "json"
        ? responseFormat
        : undefined,
  });
  if (decision.actions.length > 0) {
    log("Planning next actions", { data: decision.actions });
  } else if (isComplete) {
    log("Task complete", { data: { response: decision.response } });
  } else {
    log("No actions needed", { data: { response: decision.response } });
  }
  return decision;
}

export async function runTaskLoop<T = string>(params: {
  actions: Action[];
  context: SpinAiContext;
  model: BaseLLM;
  instructions: string;
  training?: AgentConfig["training"];
  responseFormat?: ResponseFormat;
}): Promise<AgentResponse<T>> {
  const { actions, model, instructions } = params;
  let context = { ...params.context };
  let isDone = false;
  const previousResults: Record<string, unknown> = {};
  const executedActions = new Set<string>();
  let lastDecision: LLMDecision = {
    actions: [],
    isDone: false,
    response: "Task not started" as unknown as T,
  };

  log("Processing request", { data: { input: context.input } });

  while (!isDone) {
    lastDecision = await getNextDecision(
      model,
      instructions,
      context.input,
      actions,
      previousResults,
      false,
      params.training,
      undefined
    );

    if (lastDecision.actions.length === 0 || lastDecision.isDone) {
      const finalDecision = await getNextDecision(
        model,
        instructions,
        context.input,
        actions,
        previousResults,
        true,
        params.training,
        params.responseFormat
      );
      const response = finalDecision.response as T;
      return { response, context };
    }

    const orderedActions = resolveDependencies(
      lastDecision.actions,
      actions,
      executedActions
    );

    for (const actionId of orderedActions) {
      const action = actions.find((a) => a.id === actionId);
      if (!action) {
        throw new Error(`Action ${actionId} not found`);
      }
      log(`Executing action: ${actionId}`);
      context = await action.run(context);
      previousResults[actionId] = context.state;
      executedActions.add(actionId);
    }

    isDone = lastDecision.isDone;
  }

  return {
    response: lastDecision.response as T,
    context,
  };
}
