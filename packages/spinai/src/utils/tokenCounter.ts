// Cost per 1K tokens in USD cents
const MODEL_COSTS = {
  // GPT-4 Turbo
  "gpt-4-turbo-preview": { input: 1, output: 3 },
  "gpt-4-0125-preview": { input: 1, output: 3 },
  // GPT-4
  "gpt-4": { input: 3, output: 6 },
  "gpt-4-32k": { input: 6, output: 12 },
  // GPT-3.5
  "gpt-3.5-turbo": { input: 0.1, output: 0.2 },
  "gpt-3.5-turbo-16k": { input: 0.3, output: 0.4 },
  // Claude
  "claude-3-opus-20240229": { input: 1.5, output: 4.5 },
  "claude-3-sonnet-20240229": { input: 0.3, output: 0.9 },
  "claude-3-haiku-20240307": { input: 0.125, output: 0.375 },
} as const;

type ModelId = keyof typeof MODEL_COSTS;

function isKnownModel(model: string): model is ModelId {
  return model in MODEL_COSTS;
}

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  if (!isKnownModel(model)) {
    // Default to GPT-3.5 Turbo pricing if unknown
    model = "gpt-3.5-turbo";
  }

  const costs = MODEL_COSTS[model as ModelId];
  // Costs are in cents per 1000 tokens
  const inputCostCents = (inputTokens / 1000) * costs.input;
  const outputCostCents = (outputTokens / 1000) * costs.output;

  // Round to 2 decimal places to keep fractional cents
  return Number((inputCostCents + outputCostCents).toFixed(2));
}
