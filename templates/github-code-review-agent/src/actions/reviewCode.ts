import { createAction } from "spinai";
import type { SpinAiContext } from "spinai";
import type { ReviewResponse, FileReview, ReviewState } from "../types";
import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

// Maximum size of file patch to review (in characters)
const MAX_PATCH_SIZE = 20000;

interface PullRequestParameters {
  owner: string;
  repo: string;
  pull_number: number;
  botName?: string;
}

export const reviewCode = createAction({
  id: "reviewCode",
  description: "Reviews code changes in a PR and generates feedback",
  parameters: {
    type: "object",
    properties: {
      owner: { type: "string", description: "Repository owner" },
      repo: { type: "string", description: "Repository name" },
      pull_number: { type: "number", description: "PR number" },
      botName: {
        type: "string",
        description: "Name of the bot to use for comments",
      },
    },
    required: ["owner", "repo", "pull_number"],
  },
  async run(
    context: SpinAiContext,
    parameters?: Record<string, unknown>
  ): Promise<SpinAiContext> {
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required for code review"
      );
    }

    if (!process.env.GITHUB_TOKEN) {
      throw new Error(
        "GITHUB_TOKEN environment variable is required for fetching PR details"
      );
    }

    // Initialize API clients
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // Parse and validate parameters
    const params = parameters as Record<string, unknown>;
    if (
      !params?.owner ||
      !params?.repo ||
      typeof params.owner !== "string" ||
      typeof params.repo !== "string" ||
      typeof params.pull_number !== "number"
    ) {
      throw new Error(
        "Missing or invalid required parameters: owner, repo, or pull_number"
      );
    }

    const pullRequestParams: PullRequestParameters = {
      owner: params.owner,
      repo: params.repo,
      pull_number: params.pull_number,
      botName:
        typeof params.botName === "string" ? params.botName : "SpinAI Bot 🤖",
    };

    // Get PR diff
    const { data: files } = await octokit.pulls.listFiles({
      owner: pullRequestParams.owner,
      repo: pullRequestParams.repo,
      pull_number: pullRequestParams.pull_number,
    });

    const reviews: FileReview[] = [];

    for (const file of files) {
      // Skip files that are too large or binary
      if (!file.patch || file.patch.length > MAX_PATCH_SIZE) continue;

      const lineMap = buildLineMap(file.patch);
      const validLineNumbers = Array.from(lineMap.keys()).sort((a, b) => a - b);

      // Skip files with no valid lines to review
      if (validLineNumbers.length === 0) continue;

      const feedback = await getAIFeedback(
        { filename: file.filename, patch: file.patch },
        validLineNumbers,
        openai
      );

      // Filter out any comments that reference invalid line numbers
      const validFeedback = feedback.filter((item) => lineMap.has(item.line));

      if (validFeedback.length > 0) {
        reviews.push({
          file: file.filename,
          feedback: validFeedback,
        });
      }
    }

    // Update context state
    const state = context.state as ReviewState;
    state.reviews = reviews;
    state.botName = pullRequestParams.botName;
    return context;
  },
});

/**
 * Builds a map of valid line numbers from a git patch
 * Only includes added or modified lines (starting with +)
 */
function buildLineMap(patch: string): Map<number, number> {
  const lines = patch.split("\n");
  const lineMap = new Map<number, number>();
  let currentNewLine = 0;
  let isInHunk = false;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      isInHunk = true;
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        currentNewLine = parseInt(match[1], 10) - 1;
      }
      continue;
    }

    if (!isInHunk) continue;

    if (line.startsWith("+")) {
      // This is a new or modified line
      currentNewLine++;
      lineMap.set(currentNewLine, currentNewLine);
    } else if (line.startsWith("-")) {
      // Skip deleted lines
      continue;
    } else {
      // Context line (unchanged)
      currentNewLine++;
    }
  }

  return lineMap;
}

/**
 * Gets AI feedback for a file using OpenAI's GPT-4
 */
async function getAIFeedback(
  file: { filename: string; patch: string },
  validLineNumbers: number[],
  openai: OpenAI
): Promise<ReviewResponse["feedback"]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `frfr you're a Gen Z code reviewer who's literally goated at programming no cap! 
        keep it real w/ current slang & emojis but also be mad smart about code fr fr.
        
        RULES FOR COMMENTING (NO SKIPS!!):
        1. only comment on the new/changed lines (starts w/ "+")
        2. drop comments ONLY when u see:
           - bugs that'll make it flop fr
           - security looking mad sus rn
           - code running slower than my wifi fr
           - no error handling = big yikes
           - code that needs to be more aesthetic
           - vars named like they're from 2010 💀
           - any types making it mid
           - complex stuff with zero docs = ain't it
        3. comments gotta be about that specific line no cap
        4. before commenting check:
           - u get the whole vibe fr
           - ur suggestion gonna make it hit fr
           - right place to comment no cap
        5. don't be basic with generic praise
        6. no cap we need real feedback only
        
        GOOD COMMENT EXAMPLES (real ones only):
        - "nahhh this .find() boutta return undefined fr fr 💀 add a null check rn"
        - "no error handling? that's kinda mid bestie 😭 wrap in try-catch"
        - "O(n²)? naur... use a Set and make it zoom fr fr ⚡️"
        - "any type detected = instant flop 🚩 fix it rn bestie"
        - "deadass need a const here no cap 💯"
        
        BAD COMMENTS (not it bestie):
        - "slay!" (too basic fr)
        - "ate" (we need more info)
        - "add docs?" (be specific)
        - "L code" (help them fix it)`,
      },
      {
        role: "user",
        content: `review this code fr fr and make it hit! 
        only comment when u see something that needs to level up no cap!
        
        File: ${file.filename}
        Valid line numbers you can comment on: ${validLineNumbers.join(", ")}
        
        Changes:
        ${file.patch}`,
      },
    ],
    functions: [
      {
        name: "provide_code_review",
        description: "Provide code review feedback for specific lines of code",
        parameters: {
          type: "object",
          properties: {
            feedback: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  line: {
                    type: "number",
                    description:
                      "The line number in the new version of the file",
                  },
                  comment: {
                    type: "string",
                    description: "The review comment for this line",
                  },
                },
                required: ["line", "comment"],
              },
            },
          },
          required: ["feedback"],
        },
      },
    ],
    function_call: { name: "provide_code_review" },
  });

  const functionCall = completion.choices[0].message.function_call;
  if (!functionCall?.arguments) {
    return [];
  }

  const response = JSON.parse(functionCall.arguments) as ReviewResponse;
  return response.feedback;
}
