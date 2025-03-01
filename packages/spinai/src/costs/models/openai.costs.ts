import { ModelCostsMap } from "../costs.types";

/**
 * Cost per 1M tokens in USD for OpenAI models
 */
export const OPENAI_MODEL_COSTS: ModelCostsMap = {
  // GPT-4 Models
  "gpt-4-0125-preview": { input: 10, output: 30 },
  "gpt-4-1106-preview": { input: 10, output: 30 },
  "gpt-4-vision-preview": { input: 10, output: 30 },
  "gpt-4": { input: 30, output: 60 },
  "gpt-4-32k": { input: 60, output: 120 },
  "gpt-4o": { input: 250, output: 1000 },
  "gpt-4o-mini": { input: 15, output: 60 },

  // GPT-3.5 Models
  "gpt-3.5-turbo-0125": { input: 0.5, output: 1.5 },
  "gpt-3.5-turbo-instruct": { input: 1.5, output: 2 },
  "gpt-3.5-turbo-16k": { input: 0.5, output: 1.5 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
};
