import { ModelCostsMap } from "../costs.types";

/**
 * Cost per 1M tokens in USD for Anthropic models
 */
export const ANTHROPIC_MODEL_COSTS: ModelCostsMap = {
  // Claude Models
  "claude-3-opus-20240229": { input: 15, output: 75 },
  "claude-3-sonnet-20240229": { input: 3, output: 15 },
  "claude-3-haiku-20240307": { input: 0.25, output: 1.25 },
  "claude-2.1": { input: 8, output: 24 },
  "claude-2.0": { input: 8, output: 24 },
  "claude-instant-1.2": { input: 0.8, output: 2.4 },

  // Cloudflare Anthropic Models
  "@cf/anthropic/claude-instant-1.2": { input: 0.8, output: 2.4 },
  "@cf/anthropic/claude-2.1": { input: 8.0, output: 24.0 },
};
