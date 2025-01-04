import type { Action } from "../types/action";
import type { SpinAiContext } from "../types/context";
import type {
  LLMMessage,
  LLMDecision,
  BaseLLM,
  AgentResponse,
} from "../types/llm";
import { resolveDependencies } from "./deps";
import { buildSystemPrompt } from "./promptBuilder";
import { log } from "./logger";
import type { AgentConfig } from "../types/agent";

async function getNextDecision(
  model: BaseLLM,
  instructions: string,
  input: string,
  actions: Action[],
  previousResults?: unknown,
  isComplete?: boolean,
  training?: AgentConfig["training"]
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

export async function runTaskLoop(params: {
  actions: Action[];
  context: SpinAiContext;
  model: BaseLLM;
  instructions: string;
  training?: AgentConfig["training"];
}): Promise<AgentResponse> {
  const { actions, model, instructions } = params;
  let context = { ...params.context };
  let isDone = false;
  const previousResults: Record<string, unknown> = {};
  const executedActions = new Set<string>();
  let lastDecision: LLMDecision = {
    actions: [],
    isDone: false,
    response: "Task not started",
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
      params.training
    );

    if (lastDecision.actions.length === 0) {
      return {
        response: lastDecision.response,
        context,
      };
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
    response: lastDecision.response,
    context,
  };
}
