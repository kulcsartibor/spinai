import { LanguageModelUsage } from "ai";
import { ModelId, CalculateCostParams } from "./costs.types";
import { MODEL_COSTS } from "./models";

/**
 * Checks if a model ID is known in our cost database
 * @param model The model ID to check
 * @returns Whether the model is known
 */
function isKnownModel(model: string): model is ModelId {
  return model in MODEL_COSTS;
}

/**
 * Calculates the cost in USD based on token usage
 * @param params The calculation parameters
 * @returns The cost in USD
 */
export function calculateCost(params: CalculateCostParams): number {
  const { usage, model: modelId } = params;

  // Get input and output tokens from usage
  const inputTokens = usage.promptTokens;
  const outputTokens = usage.completionTokens;

  let model = modelId;
  if (!isKnownModel(model)) {
    // Default to GPT-3.5 Turbo pricing if unknown
    model = "gpt-3.5-turbo";
  }

  const costs = MODEL_COSTS[model];
  // Costs are in USD per 1M tokens
  const inputCost = (inputTokens / 1000000) * costs.input;
  const outputCost = (outputTokens / 1000000) * costs.output;

  // Round to 6 decimal places for fractional cents
  return Number((inputCost + outputCost).toFixed(6));
}

/**
 * Calculates the cost in cents based on token usage
 * @param usage The token usage from the language model
 * @param modelId The ID of the model used
 * @returns The cost in cents
 */
export function calculateCostFromUsage(
  usage: LanguageModelUsage | undefined,
  modelId: string
): number {
  if (!usage) {
    return 0;
  }

  // Calculate cost in dollars
  const costInDollars = calculateCost({
    usage,
    model: modelId,
  });

  // Convert to cents (multiply by 100)
  return costInDollars * 100;
}
