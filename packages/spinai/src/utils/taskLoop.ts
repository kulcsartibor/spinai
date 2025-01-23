import { v4 as uuidv4 } from "uuid";
import type { Action } from "../types/action";
import type { SpinAiContext } from "../types/context";
import { type LLMMessage, type LLMDecision, type BaseLLM } from "../types/llm";
import { resolveDependencies } from "./deps";
import { buildSystemPrompt } from "./promptBuilder";
import { log, setDebugEnabled } from "./debugLogger";
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
  debug?: boolean;
}): Promise<AgentResponse<T>> {
  const { actions, model, instructions } = params;
  let context = { ...params.context };

  // Set debug logging based on parameter
  setDebugEnabled(params.debug ?? true);

  log("Starting interaction...");

  const sessionId = context.sessionId || uuidv4();
  const interactionId = uuidv4();
  context.sessionId = sessionId;
  context.interactionId = interactionId;

  const taskStartTime = Date.now();
  const logger = new LoggingService({
    agentId: params.agentId,
    spinApiKey: params.spinApiKey,
    sessionId,
    interactionId,
    llmModel: model.modelId,
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
    // Log interaction start
    await logger.logInteractionStart(context.input);

    while (!isDone) {
      const decisionStartTime = Date.now();
      const decisionMessages = [
        {
          role: "system",
          content: buildSystemPrompt(
            instructions,
            actions,
            false,
            params.training
          ),
        },
        { role: "user", content: context.input },
      ];
      if (previousResults) {
        decisionMessages.push({
          role: "user",
          content: `Previous action results: ${JSON.stringify(previousResults, null, 2)}`,
        });
      }
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

      if (decision.actions.length > 0) {
        log("Planning next actions", {
          data: {
            actions: decision.actions,
            durationMs: decisionDuration,
            reasoning: decision.reasoning,
          },
        });
      } else if (decision.isDone) {
        log("Task determined completed, generating final response", {
          data: { durationMs: decisionDuration },
        });
      }

      logger.logEvaluation(
        context.state,
        decision?.reasoning || "",
        decision.actions,
        model.modelId,
        decision.inputTokens || 0,
        decision.outputTokens || 0,
        decision.costCents || 0,
        decisionDuration,
        decision.response,
        { messages: decisionMessages },
        { rawResponse: decision.rawResponse }
      );

      lastDecision = decision;

      if (lastDecision.actions.length === 0 || lastDecision.isDone) {
        const finalDecisionStartTime = Date.now();
        const finalMessages = [
          {
            role: "system",
            content: buildSystemPrompt(
              instructions,
              actions,
              true,
              params.training
            ),
          },
          { role: "user", content: context.input },
        ];
        if (previousResults) {
          finalMessages.push({
            role: "user",
            content: `Previous action results: ${JSON.stringify(previousResults, null, 2)}`,
          });
        }
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
        const totalDuration = Date.now() - taskStartTime;

        log("Returning to user with response", {
          data: {
            response: finalDecision.response,
            durationMs: finalDecisionDuration,
            totalDuration: totalDuration,
          },
        });

        // Log final evaluation
        logger.logEvaluation(
          context.state,
          finalDecision?.reasoning || "",
          finalDecision.actions,
          model.modelId,
          finalDecision.inputTokens || 0,
          finalDecision.outputTokens || 0,
          finalDecision.costCents || 0,
          finalDecisionDuration,
          finalDecision.response,
          { messages: finalMessages },
          { rawResponse: finalDecision.rawResponse }
        );

        // Log successful interaction completion with total duration
        await logger.logInteractionComplete(
          finalDecision.response,
          totalDuration
        );

        return {
          response: finalDecision.response as T,
          sessionId,
          ...logger.getMetrics(),
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
          logger.logActionError(actionId, error, context.state, 0);
          throw new Error(error);
        }

        const actionStartTime = Date.now();

        try {
          log(`Starting action`, {
            data: { action: actionId },
          });
          context = await action.run(context);
          const actionDuration = Date.now() - actionStartTime;
          log(`Finished executing action`, {
            data: { action: actionId, durationMs: actionDuration },
          });
          logger.logActionComplete(
            actionId,
            context.state,
            actionDuration,
            context.state[actionId]
          );
          previousResults[actionId] = context.state;
          executedActions.add(actionId);
        } catch (error) {
          const actionErrorDuration = Date.now() - actionStartTime;
          logger.logActionError(
            actionId,
            error,
            context.state,
            actionErrorDuration
          );
          throw error;
        }
      }

      isDone = lastDecision.isDone;
    }

    return {
      response: lastDecision.response as T,
      sessionId,
      ...logger.getMetrics(),
    };
  } catch (error) {
    const errorDuration = Date.now() - taskStartTime;
    logger.logActionError(
      "task_loop_error",
      error,
      context.state,
      errorDuration
    );
    // Log failed interaction with total duration
    await logger.logInteractionComplete(null, errorDuration, error as Error);
    throw error;
  }
}
