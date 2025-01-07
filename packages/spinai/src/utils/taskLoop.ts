import { v4 as uuidv4 } from "uuid";
import type { Action } from "../types/action";
import type { SpinAiContext } from "../types/context";
import { type LLMMessage, type LLMDecision, type BaseLLM } from "../types/llm";
import { resolveDependencies } from "./deps";
import { buildSystemPrompt } from "./promptBuilder";
import { log } from "./logger";
import { LoggingService } from "./logging";
import type {
  AgentConfig,
  AgentResponse,
  ResponseFormat,
} from "../types/agent";

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
  agentId?: string;
  spinApiKey?: string;
}): Promise<AgentResponse<T>> {
  const { actions, model, instructions } = params;
  let context = { ...params.context };

  // Generate or use existing sessionId
  const sessionId = context.sessionId || uuidv4();
  context.sessionId = sessionId;

  // Initialize logging service
  const logger = new LoggingService({
    agentId: params.agentId,
    spinApiKey: params.spinApiKey,
    sessionId,
  });

  let isDone = false;
  const previousResults: Record<string, unknown> = {};
  const executedActions = new Set<string>();
  let lastDecision: LLMDecision = {
    actions: [],
    isDone: false,
    response: "Task not started" as unknown as T,
  };

  log("Processing request", { data: { input: context.input, sessionId } });

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

    await logger.logDecision(lastDecision);

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

      await logger.logDecision(finalDecision);

      const response = finalDecision.response as T;
      return {
        response,
        sessionId,
        isDone: true,
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
        const error = `Action ${actionId} not found`;
        await logger.logError(error);
        throw new Error(error);
      }

      log(`Executing action: ${actionId}`);
      await logger.logAction({
        actionId,
        status: "started",
      });

      try {
        const startTime = Date.now();
        context = await action.run(context);
        const duration = Date.now() - startTime;

        await logger.logAction({
          actionId,
          status: "completed",
          duration,
          result: context.state,
        });

        previousResults[actionId] = context.state;
        executedActions.add(actionId);
      } catch (error) {
        await logger.logAction({
          actionId,
          status: "failed",
          error,
        });
        throw error;
      }
    }

    isDone = lastDecision.isDone;
  }

  return {
    response: lastDecision.response as T,
    sessionId,
    isDone: true,
  };
}
