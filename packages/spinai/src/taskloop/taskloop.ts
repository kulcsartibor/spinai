/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import type { AgentResponse } from "../agents";
import { log, setDebugEnabled } from "../debug";
import { LoggingService } from "../logging";
import { RunState, TaskLoopParams } from "./taskloop.types";
import { generateObject } from "ai";
import { planningSchema } from "../planning";
import {
  Message,
  createSystemMessage,
  createUserMessage,
  createAssistantTextMessage,
  createAssistantToolCallsMessage,
  createActionResultMessage,
} from "../messages";
import { calculateCost } from "../costs";

export async function runTaskLoop<T = string>(
  params: TaskLoopParams
): Promise<AgentResponse<T>> {
  const { actions, model } = params;
  const modelId = model.modelId;
  const context = { ...params.context };
  const maxSteps = params.maxSteps ?? 10;

  // Set debug logging based on parameter
  setDebugEnabled(params.debug ?? "default");

  // Track total cost
  let totalCostCents = 0;

  // Create system message
  const systemMessage = await createSystemMessage(params.instructions, actions);
  const userMessage = await createUserMessage(context.input);
  // Initialize messages array with system message
  const messages: Message[] = [systemMessage, userMessage];

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
  const llmModel = model.modelId;
  // const modelProvider = model.provider;
  const logger = new LoggingService({
    agentId: params.agentId,
    spinApiKey: params.spinApiKey,
    sessionId,
    interactionId,
    llmModel,
    externalCustomerId: context.externalCustomerId,
    isRerun: context.isRerun ?? false,
  });

  // Initialize planner

  const runState: RunState = {
    input: context.input,
    ...context.state,
  };

  if (context?.isRerun && context?.state?.executedActions) {
    runState.previousInteractionsActions = context.state.executedActions;
  }

  try {
    // Log interaction start
    await logger.logInteractionStart(context.input);

    let stepCount = 0;
    while (stepCount < maxSteps) {
      stepCount++;
      console.log({ stepCount });
      console.log({ messages });
      const { usage, object } = await generateObject({
        model,
        schema: planningSchema,
        messages,
        mode: "json",
      });
      console.log("here");

      totalCostCents += calculateCost({ usage, model: modelId });

      const { nextActions, response } = object;
      const { reasoning, parametersReasoning, textResponse } = response;

      console.log({ reasoning, parametersReasoning, textResponse });

      if (!nextActions || nextActions.length === 0) {
        const assistantTextMessage =
          await createAssistantTextMessage(textResponse);
        messages.push(assistantTextMessage);
        break;
      }

      // Add unique toolCallId to each action
      nextActions.forEach((action) => {
        (action as any).toolCallId =
          `call_${Date.now()}_${uuidv4().substring(0, 8)}`;
      });

      // Add assistant message with reasoning and tool calls
      const assistantMessage = await createAssistantToolCallsMessage(
        textResponse,
        reasoning,
        nextActions as any
      );
      messages.push(assistantMessage);

      const actionPromises = nextActions.map(async (actionItem) => {
        const { actionId, parameters, toolCallId } = actionItem as any;
        const action = actions.find((a) => a.id === actionId);

        if (!action) {
          throw new Error(`Action ${actionId} not found`);
        }

        const actionStartTime = Date.now();
        try {
          // Execute the action and return the result
          console.log({ context, parameters });
          const actionResult = await action.run(context, parameters);
          const actionDuration = Date.now() - actionStartTime;
          console.log({ actionResult });

          // Add tool result message
          const toolResultMessage = await createActionResultMessage(
            action.id,
            actionResult,
            toolCallId
          );
          messages.push(toolResultMessage);

          log(`Finished executing ${action.id}`, {
            type: "action",
            data: {
              durationMs: actionDuration,
            },
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          log(`Action error: ${errorMessage}`, {
            type: "action",
            data: error,
          });

          // Add error tool result message
          const toolResultMessage = await createActionResultMessage(
            action.id,
            "error running action",
            toolCallId
          );
          messages.push(toolResultMessage);

          throw error;
        }
      });

      await Promise.all(actionPromises);

      // Plan next actions
      // const planResult = await planner.planNextActions({
      //   llm: model,
      //   input: context.input,
      //   runState,
      //   availableActions: actions,
      //   isRerun: context.isRerun ?? false,
      // });

      // // If no actions planned, format final response and return
      // if (planResult.actions.length === 0) {
      //   log("Generating final response...", { type: "action" });

      //   const responseResult = await planner.formatResponse({
      //     llm: model,
      //     input: context.input,
      //     plannerState,
      //     responseFormat: params.responseFormat,
      //   });
      //   totalCostCents += planner.getTotalCost();

      //   log(responseResult.response as string, { type: "response" });

      //   const totalDuration = Date.now() - taskStartTime;

      //   // Create interaction summary
      //   const interactionSummary = {
      //     interactionId,
      //     originalInput: context.input,
      //     executedActions: plannerState.executedActions,
      //     finalResponse: responseResult.response,
      //     finalState: context.state.finalState || context.state,
      //     ...(context.isRerun && context.state.previousInteraction
      //       ? {
      //           previousInteraction: {
      //             interactionId:
      //               context.state.previousInteraction.interactionId,
      //             originalInput:
      //               context.state.previousInteraction.originalInput,
      //             executedActions:
      //               context.state.previousInteraction.executedActions,
      //             finalResponse:
      //               context.state.previousInteraction.finalResponse,
      //           },
      //         }
      //       : {}),
      //   };

      //   // If this is a re-run, store current interaction as previous before updating
      //   if (context.isRerun) {
      //     context.state.previousInteraction = {
      //       interactionId: context.state.interactionId,
      //       originalInput: context.state.originalInput,
      //       executedActions: context.state.executedActions || [],
      //       finalResponse: context.state.finalResponse,
      //     };
      //   }

      //   // Store minimal interaction info in state
      //   context.state.interactionId = interactionId;
      //   context.state.originalInput = context.input;
      //   context.state.executedActions = plannerState.executedActions;
      //   context.state.finalResponse = responseResult.response;

      //   log("Interaction complete", {
      //     type: "summary",
      //     data: {
      //       durationMs: totalDuration,
      //       costCents: totalCostCents,
      //       interactionState: interactionSummary,
      //     },
      //   });

      //   await logger.logInteractionComplete(
      //     responseResult.response,
      //     totalDuration,
      //     undefined,
      //     interactionSummary
      //   );

      //   return {
      //     response: responseResult.response as T,
      //     sessionId,
      //     interactionId,
      //     totalDurationMs: totalDuration,
      //     totalCostCents: totalCostCents,
      //     state: context.state,
      //   };
      // }

      // // Execute each planned action in dependency order
      // for (const plannedActionId of planResult.actions) {
      //   const action = actions.find((a) => a.id === plannedActionId);
      //   if (!action) {
      //     const errorMessage = `Action ${plannedActionId} not found`;
      //     log(errorMessage, { type: "action" });
      //     plannerState.executedActions.push({
      //       id: plannedActionId,
      //       status: "error",
      //       errorMessage,
      //     });
      //     continue;
      //   }

      //   const maxRetries = action.retries ?? 2; // Default to 2 retries if not specified
      //   let currentRetries = actionRetries.get(plannedActionId) ?? 0;
      //   let lastError: Error | undefined;
      //   let parameters: Record<string, unknown> | undefined;

      //   // Keep retrying until success or max retries exceeded
      //   while (currentRetries <= maxRetries) {
      //     const entireActionStartTime = Date.now();

      //     try {
      //       // Only get parameters on first try or if they're undefined
      //       if (!parameters && action.parameters) {
      //         const paramResult = await planner.getActionParameters({
      //           llm: model,
      //           action: action.id,
      //           input: context.input,
      //           plannerState,
      //           availableActions: actions,
      //         });
      //         parameters = paramResult.parameters;
      //         totalCostCents += planner.getTotalCost();
      //         planner.resetCost();
      //       }

      //       const actionStartTime = Date.now();
      //       // Execute the action
      //       context = await action.run(context, parameters);
      //       const actionDuration = Date.now() - actionStartTime;
      //       log(`Finished executing ${action.id}`, {
      //         type: "action",
      //         data: {
      //           durationMs: actionDuration,
      //         },
      //       });

      //       // Reset retry count on success
      //       actionRetries.delete(plannedActionId);

      //       // Add successful execution to state
      //       plannerState.executedActions.push({
      //         id: action.id,
      //         parameters,
      //         result: context.state[action.id],
      //         status: "success",
      //       });

      //       // Log success
      //       logger.logActionComplete(
      //         action.id,
      //         context.state,
      //         actionDuration,
      //         context.state[action.id]
      //       );

      //       // Break out of retry loop on success
      //       break;
      //     } catch (error) {
      //       lastError =
      //         error instanceof Error ? error : new Error(String(error));
      //       const errorMessage = lastError.message;
      //       const actionErrorDuration = Date.now() - entireActionStartTime;

      //       // Increment retry count
      //       currentRetries++;
      //       actionRetries.set(plannedActionId, currentRetries);

      //       // Log the error with retry information
      //       if (currentRetries <= maxRetries) {
      //         log(
      //           `Action error: ${errorMessage} (Retry ${currentRetries}/${maxRetries})`,
      //           {
      //             type: "action",
      //             data: error,
      //           }
      //         );

      //         // Log error but don't add to plannerState yet
      //         logger.logActionComplete(
      //           action.id,
      //           context.state,
      //           actionErrorDuration,
      //           undefined,
      //           { message: errorMessage }
      //         );

      //         // Continue to next retry attempt
      //         continue;
      //       }

      //       // If we've exhausted all retries, mark as permanently failed
      //       log(
      //         `Action error: ${errorMessage} (Max retries ${maxRetries} exceeded)`,
      //         {
      //           type: "action",
      //           data: error,
      //         }
      //       );

      //       // Only add to plannerState after all retries are exhausted
      //       plannerState.executedActions.push({
      //         id: action.id,
      //         parameters,
      //         status: "error",
      //         errorMessage: `${errorMessage} (Max retries ${maxRetries} exceeded)`,
      //       });

      //       // Log final error
      //       logger.logActionComplete(
      //         action.id,
      //         context.state,
      //         actionErrorDuration,
      //         undefined,
      //         { message: errorMessage }
      //       );
      //     }
      //   }
      // }
    }
    console.log("done loop");
  } catch (error) {
    const errorDuration = Date.now() - taskStartTime;
    logger.logActionError(
      "task_loop_error",
      error,
      context.state || {},
      errorDuration
    );
    await logger.logInteractionComplete(null, errorDuration, error as Error);
    throw error;
  }

  console.log("Final messages:", JSON.stringify(messages, null, 2));

  // Return a response with the current state
  return {
    response: "Task completed" as unknown as T,
    sessionId,
    interactionId,
    totalDurationMs: Date.now() - taskStartTime,
    totalCostCents,
    state: context.state || {},
    messages,
  };
}
