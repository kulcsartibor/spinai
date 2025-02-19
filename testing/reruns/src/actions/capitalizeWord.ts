import { createAction } from "spinai";
import type { SpinAiContext } from "spinai";

export const capitalizeWord = createAction({
  id: "capitalizeWord",
  description: "Takes the reversed word and capitalizes it.",
  parameters: {
    type: "object",
    properties: {
      word: {
        type: "string",
        description: "The word to capitalize",
      },
    },
    required: ["word"],
  },
  async run(
    context: SpinAiContext,
    parameters?: Record<string, unknown>
  ): Promise<SpinAiContext> {
    const word = parameters?.word as string;
    if (!word) {
      throw new Error("No word parameter provided");
    }

    const capitalized = word.toUpperCase();
    context.state.word = capitalized;

    return context;
  },
});
