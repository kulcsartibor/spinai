import { createAction } from "spinai";

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
  async run({ parameters }) {
    const word = parameters?.word as string;
    if (!word) {
      throw new Error("No word parameter provided");
    }
    const capitalized = word.toUpperCase();

    return capitalized;
  },
});
