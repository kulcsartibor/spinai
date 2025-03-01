/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import type { AgentResponse } from "../agents";
import { log, setDebugEnabled } from "../debug";
import { LoggingService } from "../logging";
import { TaskLoopParams } from "./taskloop.types";
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
  taskLoopParams: TaskLoopParams
): Promise<AgentResponse<T>> {
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
  } = taskLoopParams;
  const modelId = model.modelId;
  const interactionId = uuidv4();

  // Set debug logging based on parameter
  setDebugEnabled(debug ?? "default");

  // Track total cost
  let totalCostCents = 0;

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
  const llmModel = model.modelId;
  // const modelProvider = model.provider;
  const logger = new LoggingService({
    agentId: agentId,
    spinApiKey: spinApiKey,
    sessionId,
    interactionId,
    llmModel,
    externalCustomerId: externalCustomerId,
  });

  // Initialize planner

  try {
    // Log interaction start
    await logger.logInteractionStart(input);

    let stepCount = 0;
    while (stepCount < maxSteps) {
      stepCount++;
      // console.log("messages:", JSON.stringify(messages, null, 2));
      const { usage, object } = await generateObject({
        model,
        schema: planningSchema,
        messages,
        mode: "json",
      });

      totalCostCents += calculateCost({ usage, model: modelId });

      const { nextActions, response } = object;
      const {
        reasoning,
        // parametersReasoning,
        textResponse,
      } = response;

      console.log(reasoning);
      console.log({ nextActions });

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
    }
    console.log("done loop");
  } catch (error) {
    const errorDuration = Date.now() - taskStartTime;
    logger.logActionError("task_loop_error", error, {}, errorDuration);
    await logger.logInteractionComplete(null, errorDuration, error as Error);
    throw error;
  }

  // console.log("Final messages:", JSON.stringify(messages, null, 2));

  // Return a response with the current state
  return {
    response: "Task completed" as unknown as T,
    sessionId,
    interactionId,
    totalDurationMs: Date.now() - taskStartTime,
    totalCostCents,
    state: state || {},
    messages,
  };
}
