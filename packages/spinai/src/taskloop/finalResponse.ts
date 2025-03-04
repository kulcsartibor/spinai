/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { generateObject } from "ai";
import { Message, createAssistantTextMessage } from "../messages";
import { calculateCost } from "../costs";

/**
 * Process the agent's final response based on the requested format
 */
export async function processAgentFinalResponse<T>(
  messages: Message[],
  responseFormat: "text" | z.ZodType<T> | undefined,
  model: any,
  modelId: string,
  costRef: { totalCostCents: number }
): Promise<{
  finalResponse: T;
  rawInput: any;
  usage: { promptTokens: number; completionTokens: number; costCents?: number };
}> {
  let finalResponse: T | "Task completed" = "Task completed";
  let rawInput: any = {};
  let promptTokens = 0;
  let completionTokens = 0;
  let costCents = 0;

  // Get the last assistant message text response
  const lastAssistantMessage = messages
    .slice() // Create a copy before reversing
    .reverse()
    .find(
      (msg) =>
        msg.role === "assistant" &&
        "content" in msg &&
        typeof msg.content === "string"
    );

  if (lastAssistantMessage && "content" in lastAssistantMessage) {
    finalResponse = lastAssistantMessage.content as T;
  }

  // Format the response based on responseFormat
  if (responseFormat) {
    if (responseFormat === "text") {
      // Already a string, no processing needed
    } else if (responseFormat instanceof z.ZodType) {
      try {
        // Use generateObject with the Zod schema for proper validation
        const {
          object,
          request,
          usage: genUsage,
        } = await generateObject({
          model,
          schema: responseFormat,
          messages,
          mode: "json",
        });
        finalResponse = object;
        rawInput = request;

        // Add the structured response to the messages array using the helper function
        const structuredResponseMessage = await createAssistantTextMessage(
          JSON.stringify(finalResponse, null, 2)
        );
        messages.push(structuredResponseMessage);

        promptTokens += genUsage.promptTokens;
        completionTokens += genUsage.completionTokens;
        const genCost = calculateCost({
          usage: genUsage,
          model: modelId,
        });
        costRef.totalCostCents += genCost;
        costCents += genCost;
      } catch (e) {
        console.warn("Response validation failed:", e);
      }
    }
  }

  return {
    finalResponse: finalResponse as T,
    rawInput,
    usage: { promptTokens, completionTokens, costCents },
  };
}
