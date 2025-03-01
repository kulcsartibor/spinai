/**
 * Cost structure for a model (input and output costs per 1M tokens in USD)
 */
export interface ModelCost {
  input: number;
  output: number;
}

/**
 * Map of model IDs to their cost structures
 */
export type ModelCostsMap = Record<string, ModelCost>;

/**
 * Type for model IDs in the costs map
 */
export type ModelId = string;

/**
 * Parameters for the calculateCost function
 */
export interface CalculateCostParams {
  usage: any; // LanguageModelUsage from ai package
  model: string;
}
