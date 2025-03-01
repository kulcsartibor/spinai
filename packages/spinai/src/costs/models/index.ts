import { ModelCostsMap } from "../costs.types";
import { OPENAI_MODEL_COSTS } from "./openai.costs";
import { ANTHROPIC_MODEL_COSTS } from "./anthropic.costs";
import { OTHER_MODEL_COSTS } from "./misc.costs";

/**
 * Combined cost map for all models
 */
export const MODEL_COSTS: ModelCostsMap = {
  ...OPENAI_MODEL_COSTS,
  ...ANTHROPIC_MODEL_COSTS,
  ...OTHER_MODEL_COSTS,
};
