import * as dotenv from "dotenv";
import { createAgent, createOpenAILLM } from "spinai";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { reviewCode } from "./actions/reviewCode";
import { postReviewComments } from "./actions/postReviewComments";
import { ReviewState } from "./types";
dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}
if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is required");
}

const llm = createOpenAILLM({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});

const codeReviewAgent = createAgent<ReviewState>({
  instructions: `You are a code review agent that analyzes pull requests and provides helpful feedback.
  You focus on code quality, best practices, potential bugs, and security concerns.
  Your feedback should be specific, actionable, and constructive.

  When reviewing code:
  1. First analyze each changed file for potential improvements
  2. Generate specific, line-by-line feedback
  3. Post the feedback as review comments on the PR`,
  actions: [reviewCode, postReviewComments],
  llm,
});

// Set up Hono app
const app = new Hono();

interface GitHubWebhookBody {
  action: string;
  pull_request: {
    number: number;
  };
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
}

app.post("/webhook", async (c) => {
  try {
    console.log("Received webhook request");
    const event = c.req.header("x-github-event");

    if (!event) {
      console.log("No GitHub event header found");
      return c.json({ error: "No GitHub event header found" }, 400);
    }

    const body = await c.req.json<GitHubWebhookBody>();

    if (
      event === "pull_request" &&
      (body.action === "opened" || body.action === "synchronize")
    ) {
      const { pull_request, repository } = body;

      try {
        console.log("Starting PR review for:", {
          repo: repository.name,
          pr: pull_request.number,
          action: body.action,
        });

        const {
          response,
          totalCostCents,
          totalDurationMs,
          sessionId,
          interactionId,
        } = await codeReviewAgent({
          input: `Review pull request #${pull_request.number}`,
          externalCustomerId: repository.owner.login,
          state: {
            owner: repository.owner.login,
            repo: repository.name,
            pull_number: pull_request.number,
          },
        });

        console.log("Review completed:", {
          sessionId,
          interactionId,
          totalCostCents,
        });

        return c.json({
          message: "Review completed successfully",
          response,
          totalCostCents,
          totalDurationMs,
          sessionId,
          interactionId,
        });
      } catch (error) {
        console.error("Error processing PR review:", error);
        // Log the full error object for debugging
        console.error(
          "Full error:",
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        );
        return c.json(
          {
            error: "Failed to process PR review",
            details: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }

    return c.json({ message: "Event ignored" });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Log the full error object for debugging
    console.error(
      "Full error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
    return c.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

const port = parseInt(process.env.PORT || "3000", 10);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
