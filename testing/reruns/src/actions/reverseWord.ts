import { createAction } from "spinai";
import type { SpinAiContext } from "spinai";

export const reverseWord = createAction({
  id: "reverseWord",
  description: "Takes the generated word and reverses it.",
  parameters: {
    type: "object",
    properties: {
      word: {
        type: "string",
        description: "The word to reverse",
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

    const reversed = word.split("").reverse().join("");
    context.state.reversedWord = reversed;

    return context;
  },
});
