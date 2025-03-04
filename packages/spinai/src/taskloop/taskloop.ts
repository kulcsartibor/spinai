/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import type { AgentResponse, InferResponseType } from "../agents";
import { log, setDebugEnabled } from "../debug";
import { LoggingService } from "../logging";
import { TaskLoopParams } from "./taskloop.types";
import { planningSchema } from "../planning";
import { generateObject } from "ai";
import {
  Message,
  createSystemMessage,
  createUserMessage,
  createAssistantTextMessage,
  createAssistantToolCallsMessage,
  createActionResultMessage,
} from "../messages";
import { calculateCost } from "../costs";
import { z } from "zod";
import { processAgentFinalResponse } from "./finalResponse";

export async function runTaskLoop<
  TResponseFormat extends "text" | z.ZodType<any> = "text",
  TResponse = InferResponseType<TResponseFormat>,
>(
  taskLoopParams: TaskLoopParams<TResponseFormat>
): Promise<AgentResponse<TResponse>> {
  const {
    actions,
    model,
    input,
    externalCustomerId,
    maxSteps = 10,
    instructions,
    debug,
    sessionId = uuidv4(),
    agentId,
    spinApiKey,
    state,
    responseFormat = "text",
    customLoggingEndpoint,
  } = taskLoopParams;
  const modelId = model.modelId;
  const interactionId = uuidv4();

  // Set debug logging based on parameter
  setDebugEnabled(debug ?? "default");

  // Track total cost
  let totalCostCents = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  // Create system message
  const systemMessage = await createSystemMessage(instructions, actions);
  const userMessage = await createUserMessage(input);
  // Initialize messages array with system message
  const messages: Message[] = [systemMessage, userMessage];

  log(`Starting interaction with ${debug ?? "default"} logging`, {
    type: "summary",
  });

  // Initialize logging service
  const taskStartTime = Date.now();

  const logger = new LoggingService({
    agentId: agentId,
    spinApiKey: spinApiKey,
    sessionId,
    interactionId,
    modelId,
    modelProvider: model.provider,
    externalCustomerId: externalCustomerId,
    loggingEndpoint: customLoggingEndpoint,
    isRerun: taskLoopParams.isRerun,
    input,
    initialState: state || {},
  });

  try {
    // Log interaction start
    logger.logInteractionStart();

    let stepCount = 0;

    // THE "LOOP" IN TASKLOOP
    while (stepCount < maxSteps) {
      stepCount++;
      // console.log("messages:", JSON.stringify(messages, null, 2));
      const stepStartTime = Date.now();
      const { usage, object, request } = await generateObject({
        model,
        schema: planningSchema,
        messages,
        mode: "json",
      });

      const { body: rawInput } = request || {};

      const costCents = calculateCost({ usage, model: modelId });
      totalCostCents += costCents;
      totalPromptTokens += usage?.promptTokens;
      totalCompletionTokens += usage?.completionTokens;

      const { nextActions, response } = object;
      const { reasoning, textResponse } = response;

      // Log the planning step
      logger.logPlanning({
        reasoning,
        textResponse,
        nextActions,
        promptTokens: usage?.promptTokens,
        completionTokens: usage?.completionTokens,
        costCents,
        durationMs: Date.now() - stepStartTime,
        state,
        rawInput,
        rawOutput: object,
        status: "completed",
      });

      console.log(reasoning);

      if (!nextActions || nextActions.length === 0) {
        if (responseFormat === "text") {
          const assistantTextMessage =
            await createAssistantTextMessage(textResponse);
          console.log({ assistantTextMessage });
          messages.push(assistantTextMessage);
        }
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
          const actionResult = await action.run({
            context: taskLoopParams,
            parameters,
          });
          const actionDuration = Date.now() - actionStartTime;

          // Add tool result message
          const actionResultMessage = await createActionResultMessage(
            action.id,
            actionResult,
            toolCallId
          );
          messages.push(actionResultMessage);

          // Log the action execution
          logger.logAction({
            actionId: action.id,
            parameters,
            result: actionResult,
            durationMs: actionDuration,
            state,
          });

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

          // Log the action error
          logger.logAction({
            actionId: action.id,
            parameters,
            result: "error running action",
            durationMs: Date.now() - actionStartTime,
            state,
            error: error instanceof Error ? error : new Error(String(error)),
          });

          // Add error tool result message
          const toolResultMessage = await createActionResultMessage(
            action.id,
            "error running action",
            toolCallId
          );
          messages.push(toolResultMessage);
        }
      });

      await Promise.all(actionPromises);
    }
  } catch (error) {
    console.log(error);
  }

  // Process the final agent response
  const responseStartTime = Date.now();
  const costRef = { totalCostCents };
  const { finalResponse, rawInput, usage } =
    await processAgentFinalResponse<TResponse>(
      messages,
      responseFormat,
      model,
      modelId,
      costRef
    );

  totalCostCents = costRef.totalCostCents;
  totalPromptTokens += usage?.promptTokens;
  totalCompletionTokens += usage?.completionTokens;

  // Log the final response (no usage available from processAgentFinalResponse)
  logger.logFinalResponse({
    response: finalResponse,
    usage: {
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      costCents: usage.costCents,
    },
    durationMs: Date.now() - responseStartTime,
    state: state || {},
    rawInput,
    rawOutput: finalResponse,
  });

  // Log interaction complete
  logger.logInteractionComplete({
    response: finalResponse,
    durationMs: Date.now() - taskStartTime,
    state: state || {},
    messages,
    totalCostCents,
    totalPromptTokens,
    totalCompletionTokens,
  });

  // Return a response with the current state
  return {
    response: finalResponse,
    sessionId,
    interactionId,
    totalDurationMs: Date.now() - taskStartTime,
    totalCostCents,
    totalPromptTokens,
    totalCompletionTokens,
    state: state || {},
    messages,
  };
}
