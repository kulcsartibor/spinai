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

  try {
    // Fire and forget logging
    logger.logTaskStart(context.input);

    log("Processing request", { data: { input: context.input, sessionId } });

    while (!isDone) {
      const decision = await getNextDecision(
        model,
        instructions,
        context.input,
        actions,
        previousResults,
        false,
        params.training,
        undefined
      );

      // Fire and forget logging
      logger.logDecision(context.input, decision, {
        messages:
          decision.actions.length > 0
            ? "Planning actions"
            : "No actions needed",
        responseFormat: undefined,
      });

      lastDecision = decision;

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

        // Fire and forget logging
        logger.logDecision(context.input, finalDecision, {
          messages: "Final response",
          responseFormat: params.responseFormat,
        });

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
          logger.logError(error, { actionId });
          throw new Error(error);
        }

        log(`Executing action: ${actionId}`);
        logger.logActionStart(actionId);

        try {
          context = await action.run(context);
          logger.logActionComplete(actionId, context.state);
          previousResults[actionId] = context.state;
          executedActions.add(actionId);
        } catch (error) {
          logger.logActionError(actionId, error);
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
  } catch (error) {
    logger.logError(error, {
      input: context.input,
      lastDecision,
      executedActions: Array.from(executedActions),
    });
    throw error;
  }
}
