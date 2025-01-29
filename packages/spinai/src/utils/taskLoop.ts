import { v4 as uuidv4 } from "uuid";
import type { Action } from "../types/action";
import type { SpinAiContext } from "../types/context";
import type {
  AgentConfig,
  AgentResponse,
  ResponseFormat,
} from "../types/agent";
import { resolveDependencies } from "./deps";
import { log, setDebugEnabled } from "./debugLogger";
import { LoggingService } from "./logging";
import { BasePlanner } from "../decisions/planner";
import { LLM } from "../llms/base";
import { ActionPlannerState } from "../types/planner";
import { DebugMode } from "../types/debug";

export async function runTaskLoop<T = string>(params: {
  actions: Action[];
  context: SpinAiContext;
  model: LLM;
  instructions: string;
  training?: AgentConfig["training"];
  responseFormat?: ResponseFormat;
  agentId?: string;
  spinApiKey?: string;
  debug?: DebugMode;
}): Promise<AgentResponse<T>> {
  const { actions, model } = params;
  let context = { ...params.context };

  // Set debug logging based on parameter
  setDebugEnabled(params.debug ?? "default");

  // Track total cost
  let totalCostCents = 0;

  log(`Starting interaction with ${params.debug ?? "default"} logging`, {
    type: "summary",
  });

  // Initialize session tracking
  const sessionId = context.sessionId || uuidv4();
  const interactionId = uuidv4();
  context.sessionId = sessionId;
  context.interactionId = interactionId;

  // Initialize logging service
  const taskStartTime = Date.now();
  const logger = new LoggingService({
    agentId: params.agentId,
    spinApiKey: params.spinApiKey,
    sessionId,
    interactionId,
    llmModel: model.modelName,
    externalCustomerId: context.externalCustomerId,
    isRerun: context.isRerun ?? false,
  });

  // Initialize planner
  const planner = new BasePlanner(logger, params.instructions);

  // Initialize state tracking
  const executedActions = new Set<string>();
  const plannerState: ActionPlannerState = {
    input: context.input,
    context: context.state,
    executedActions: [],
  };

  try {
    // Log interaction start
    await logger.logInteractionStart(context.input);

    while (true) {
      // Plan next actions
      const planResult = await planner.planNextActions({
        llm: model,
        input: context.input,
        state: plannerState,
        availableActions: actions,
        isRerun: context.isRerun ?? false,
      });
      totalCostCents += planner.getTotalCost();
      planner.resetCost();

      // If no actions planned, format final response and return
      if (planResult.actions.length === 0) {
        log("Generating final response...", { type: "action" });

        const responseResult = await planner.formatResponse({
          llm: model,
          input: context.input,
          state: plannerState,
          responseFormat: params.responseFormat,
        });
        totalCostCents += planner.getTotalCost();

        log(responseResult.response as string, { type: "response" });

        const totalDuration = Date.now() - taskStartTime;

        // Get executed actions with their parameters
        const actionSummary = plannerState.executedActions.map((action) => {
          const paramStr = action.parameters
            ? ` (${JSON.stringify(action.parameters)})`
            : "";
          const resultStr =
            action.result !== undefined ? ` -> ${action.result}` : "";
          return `${action.id}${paramStr}${resultStr}`;
        });

        // Create interaction summary
        const interactionSummary = {
          interactionId,
          originalInput: context.input,
          executedActions: plannerState.executedActions,
          finalResponse: responseResult.response,
          finalState: context.state.finalState || context.state,
          ...(context.isRerun && context.state.previousInteraction
            ? {
                previousInteraction: {
                  interactionId:
                    context.state.previousInteraction.interactionId,
                  originalInput:
                    context.state.previousInteraction.originalInput,
                  executedActions:
                    context.state.previousInteraction.executedActions,
                  finalResponse:
                    context.state.previousInteraction.finalResponse,
                },
              }
            : {}),
        };

        // If this is a re-run, store current interaction as previous before updating
        if (context.isRerun) {
          context.state.previousInteraction = {
            interactionId: context.state.interactionId,
            originalInput: context.state.originalInput,
            executedActions: context.state.executedActions || [],
            finalResponse: context.state.finalResponse,
          };
        }

        // Store minimal interaction info in state
        context.state.interactionId = interactionId;
        context.state.originalInput = context.input;
        context.state.executedActions = plannerState.executedActions;
        context.state.finalResponse = responseResult.response;

        log("Interaction complete", {
          type: "summary",
          data: {
            durationMs: totalDuration,
            costCents: totalCostCents,
            executedActions:
              actionSummary.length > 0 ? actionSummary : undefined,
            interactionState: interactionSummary,
          },
        });

        await logger.logInteractionComplete(
          responseResult.response,
          totalDuration,
          undefined,
          interactionSummary
        );

        return {
          response: responseResult.response as T,
          sessionId,
          interactionId,
          totalDurationMs: totalDuration,
          totalCostCents: totalCostCents,
          state: context.state,
        };
      }

      // Resolve dependencies and execute actions
      const orderedActions = resolveDependencies(planResult.actions, actions);

      for (const actionId of orderedActions) {
        const action = actions.find((a) => a.id === actionId);
        if (!action) {
          const error = `Action ${actionId} not found`;
          logger.logActionError(actionId, error, context.state, 0);
          throw new Error(error);
        }

        const actionStartTime = Date.now();

        try {
          // Get parameters for the action if needed
          let parameters: Record<string, unknown> | undefined;
          if (action.parameters) {
            const paramResult = await planner.getActionParameters({
              llm: model,
              action: actionId,
              input: context.input,
              state: plannerState,
              availableActions: actions,
            });
            parameters = paramResult.parameters;
            totalCostCents += planner.getTotalCost();
            planner.resetCost();
          }

          // Execute the action
          context = await action.run(context, parameters);
          const actionDuration = Date.now() - actionStartTime;

          log(`Finished action: ${actionId}`, {
            type: "action",
            data: {
              durationMs: actionDuration,
            },
          });

          // Log success and update state
          logger.logActionComplete(
            actionId,
            context.state,
            actionDuration,
            context.state[actionId]
          );

          executedActions.add(actionId);
          plannerState.executedActions.push({
            id: actionId,
            parameters,
            result: context.state[actionId],
          });
          plannerState.context = context.state;
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
    }
  } catch (error) {
    const errorDuration = Date.now() - taskStartTime;
    logger.logActionError(
      "task_loop_error",
      error,
      context.state,
      errorDuration
    );
    await logger.logInteractionComplete(null, errorDuration, error as Error);
    throw error;
  }
}
