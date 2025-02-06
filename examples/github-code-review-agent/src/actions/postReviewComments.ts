import { createAction } from "spinai";
import type { SpinAiContext } from "spinai";
import { FileReview, ReviewFeedback, ReviewState } from "../types";
import { Octokit } from "@octokit/rest";

export const postReviewComments = createAction({
  id: "postReviewComments",
  description: "Posts review comments on the PR",
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
    if (!process.env.GITHUB_TOKEN) {
      throw new Error(
        "GITHUB_TOKEN environment variable is required for posting reviews"
      );
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const {
      owner,
      repo,
      pull_number,
      botName = "SpinAI Bot 🤖",
    } = parameters || {};

    const state = context.state as ReviewState;
    const { reviews } = state;

    if (!reviews) {
      throw new Error("No reviews found in context");
    }

    // Create a review with all comments
    const comments = reviews.flatMap((review: FileReview) =>
      review.feedback.map((feedback: ReviewFeedback) => ({
        path: review.file,
        line: feedback.line,
        body: feedback.comment,
      }))
    );

    await octokit.pulls.createReview({
      owner: owner as string,
      repo: repo as string,
      pull_number: pull_number as number,
      event: "COMMENT",
      comments,
      body: `heyyy bestie! ✨ just did a vibe check on your code! dropped some comments for you to slay through 💅 keep coding bestie, you're doing amazing! 🚀`,
    });

    return context;
  },
});
