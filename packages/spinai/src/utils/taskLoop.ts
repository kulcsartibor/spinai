import { v4 as uuidv4 } from "uuid";
import type { Action } from "../types/action";
import type { SpinAiContext } from "../types/context";
import { type LLMMessage, type LLMDecision, type BaseLLM } from "../types/llm";
import { resolveDependencies } from "./deps";
import { buildSystemPrompt } from "./promptBuilder";
import { log } from "./debugLogger";
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

  return { ...decision };
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

  const sessionId = context.sessionId || uuidv4();
  context.sessionId = sessionId;

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
  const taskStartTime = Date.now();
  try {
    logger.logUserInput(context.input, 0);

    while (!isDone) {
      const decisionStartTime = Date.now();
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
      const decisionDuration = Date.now() - decisionStartTime;

      logger.logEvaluation(
        context.input,
        decision.reasoning,
        decision.actions,
        model.modelId,
        { input_tokens: 0, output_tokens: 0, total_tokens: 0 }, // Placeholder
        0, // Placeholder cost
        decisionDuration
      );

      lastDecision = decision;

      if (lastDecision.actions.length === 0 || lastDecision.isDone) {
        const finalDecisionStartTime = Date.now();
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
        const finalDecisionDuration = Date.now() - finalDecisionStartTime;

        logger.logFinalResponse(
          finalDecision.response as string,
          model.modelId,
          { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
          0,
          finalDecisionDuration
        );

        return {
          response: finalDecision.response as T,
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
          logger.logActionError(actionId, error, 0);
          throw new Error(error);
        }

        const actionStartTime = Date.now();

        try {
          context = await action.run(context);
          const actionDuration = Date.now() - actionStartTime;
          logger.logActionComplete(actionId, context.state, actionDuration);
          previousResults[actionId] = context.state;
          executedActions.add(actionId);
        } catch (error) {
          const actionErrorDuration = Date.now() - actionStartTime;
          logger.logActionError(actionId, error, actionErrorDuration);
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
    const taskErrorDuration = Date.now() - taskStartTime;
    logger.logActionError("task_loop_error", error, taskErrorDuration);
    throw error;
  }
}
