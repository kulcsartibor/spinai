import { createAction } from "spinai";

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
  async run({ parameters }) {
    const word = parameters?.word as string;
    if (!word) {
      throw new Error("No word parameter provided");
    }
    const reversedWord = word.split("").reverse().join("");

    return reversedWord;
  },
});
