import * as dotenv from "dotenv";
import { createAgent, createOpenAILLM } from "spinai";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { reviewCode } from "./actions/reviewCode";
import { postReviewComments } from "./actions/postReviewComments";
import { ReviewState } from "./types";
import { BitbucketWebhookPayload } from "./bitbucketTypes";
dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}
if (!process.env.BITBUCKET_ACCESS_TOKEN) {
  throw new Error("BITBUCKET_ACCESS_TOKEN is required");
}

const llm = createOpenAILLM({
  apiKey: process.env.OPENAI_API_KEY,
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

app.post("/webhook", async (c) => {
  try {
    console.log("Received webhook request");
    const event = c.req.header("x-event-key");

    if (!event) {
      console.log("No Bitbucket event header found");
      return c.json({ error: "No Bitbucket event header found" }, 400);
    }

    const body = await c.req.json<BitbucketWebhookPayload>();

    if (event === "pullrequest:created" || event === "pullrequest:updated") {
      const { pullrequest, repository } = body;
      const [workspace, repo_slug] = repository.full_name.split("/");

      try {
        console.log("Starting PR review for:", {
          repo: repo_slug,
          pr: pullrequest.id,
          action: event,
        });

        const {
          response,
          totalCostCents,
          totalDurationMs,
          sessionId,
          interactionId,
        } = await codeReviewAgent({
          input: `Review pull request #${pullrequest.id}`,
          externalCustomerId: workspace,
          state: {
            workspace,
            repo_slug,
            pull_request_id: pullrequest.id,
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

// Add a new endpoint for manual PR review
app.post("/review-pr", async (c) => {
  try {
    const { workspace, repo_slug, pull_request_id } = await c.req.json();

    if (!workspace || !repo_slug || !pull_request_id) {
      return c.json(
        {
          error:
            "Missing required parameters: workspace, repo_slug, pull_request_id",
        },
        400
      );
    }

    try {
      console.log("Starting manual PR review for:", {
        workspace,
        repo: repo_slug,
        pr: pull_request_id,
      });

      const {
        response,
        totalCostCents,
        totalDurationMs,
        sessionId,
        interactionId,
      } = await codeReviewAgent({
        input: `Review pull request #${pull_request_id}`,
        externalCustomerId: workspace,
        state: {
          workspace,
          repo_slug,
          pull_request_id,
        },
      });

      console.log("Manual review completed:", {
        sessionId,
        interactionId,
        totalCostCents,
      });

      return c.json({
        message: "Manual review completed successfully",
        response,
        totalCostCents,
        totalDurationMs,
        sessionId,
        interactionId,
      });
    } catch (error) {
      console.error("Error processing manual PR review:", error);
      console.error(
        "Full error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );

      // Add specific error handling for Bitbucket API errors
      if (error instanceof Error && error.message.includes("Not Found")) {
        return c.json(
          {
            error: "Pull request not found",
            details: `Could not find PR #${pull_request_id} in repository ${workspace}/${repo_slug}. Please verify: 
            1. The PR exists
            2. The repository name is correct
            3. The BITBUCKET_ACCESS_TOKEN has proper permissions`,
          },
          404
        );
      }

      return c.json(
        {
          error: "Failed to process manual PR review",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  } catch (error) {
    console.error("Manual review handler error:", error);
    return c.json(
      {
        error: "Manual review processing failed",
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
