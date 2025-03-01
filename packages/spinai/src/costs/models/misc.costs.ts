import { ModelCostsMap } from "../costs.types";

/**
 * Cost per 1M tokens in USD for other models
 */
export const OTHER_MODEL_COSTS: ModelCostsMap = {
  // Cloudflare AI Models (non-Anthropic)
  "@cf/meta/llama-2-7b-chat-int8": { input: 0.2, output: 0.4 },
  "@cf/meta/llama-2-13b-chat-int8": { input: 0.4, output: 0.8 },
  "@cf/meta/llama-2-70b-chat-int8": { input: 1.0, output: 2.0 },
  "@cf/mistral/mistral-7b-instruct-v0.1": { input: 0.2, output: 0.4 },
  "@cf/tiiuae/falcon-7b-instruct": { input: 0.2, output: 0.4 },

  // Deepseek Models
  "deepseek-chat": { input: 0.27, output: 1.1 },
  "deepseek-reasoner": { input: 0.55, output: 2.19 },

  // Default/Custom
  "custom-http-model": { input: 0.5, output: 1.5 },
};
