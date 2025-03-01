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
  responseFormat: "text" | z.ZodType<any> | undefined,
  model: any,
  modelId: string,
  costRef: { totalCostCents: number }
): Promise<T> {
  let finalResponse: any = "Task completed";

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
    finalResponse = lastAssistantMessage.content;
  }

  // Format the response based on responseFormat
  if (responseFormat) {
    if (responseFormat === "text") {
      // Already a string, no processing needed
    } else if (responseFormat instanceof z.ZodType) {
      try {
        // Use generateObject with the Zod schema for proper validation
        const result = await generateObject({
          model,
          schema: responseFormat,
          messages,
          mode: "json",
        });

        finalResponse = result.object;

        // Add the structured response to the messages array using the helper function
        const structuredResponseMessage = await createAssistantTextMessage(
          `Structured Response: ${JSON.stringify(finalResponse, null, 2)}`
        );
        messages.push(structuredResponseMessage);

        // Add the cost of this final generation
        costRef.totalCostCents += calculateCost({
          usage: result.usage,
          model: modelId,
        });
      } catch (e) {
        console.warn("Response validation failed:", e);
      }
    }
  }

  return finalResponse as T;
}
