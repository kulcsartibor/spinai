import express from "express";
import { loadActions, loadOrchestrator } from "../utils/loader";
import { log } from "../utils/logger";
import type {
  BaseOrchestrator,
  OrchestratorMessage,
} from "../types/orchestrator";
import type { SpinupConfig } from "../types/config";
import { resolveDependencies } from "../utils/dag";
import * as path from "path";

const DEFAULT_PORT = 8080;

async function getNextDecision(
  orchestrator: BaseOrchestrator,
  systemPrompt: string,
  input: string,
  previousResults?: unknown
) {
  const messages: OrchestratorMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: input },
  ];

  if (previousResults) {
    messages.push({
      role: "user",
      content: `Previous action results: ${JSON.stringify(previousResults, null, 2)}`,
    });
  }

  return orchestrator.decide(messages);
}

async function createServer(config: SpinupConfig) {
  // Load actions and orchestrator
  const availableActions = await loadActions(config.actionDirectoryPath);
  const orchestrator = await loadOrchestrator(config.orchestratorDirectoryPath);
  await orchestrator.initialize();

  // Build enhanced prompt
  const actionDescriptions = Object.entries(availableActions)
    .map(
      ([id, action]) =>
        `- ${id}: ${action.config.metadata?.description || "No description"}`
    )
    .join("\n");

  const enhancedSystemPrompt = `Available actions:\n${actionDescriptions}\n\n${orchestrator.systemPrompt}`;

  const app = express();
  app.use(express.json());

  app.post("/api/run", async (req, res) => {
    try {
      const { input } = req.body;
      log("New request received", { data: input });

      const context = {
        request: {
          input,
          metadata: {}, // For any additional request metadata
        },
        store: {},
        actions: availableActions,
      };

      let previousResults = null;
      let isDone = false;
      const executedActions = new Set<string>();

      while (!isDone) {
        log("Consulting orchestrator...");
        const decision = await getNextDecision(
          orchestrator,
          enhancedSystemPrompt,
          input,
          previousResults
        );
        log("Orchestrator decision", { data: decision });

        if (decision.actions.length === 0) {
          log("Task complete");
          return res.json({
            summary: decision.summary,
            results: previousResults,
          });
        }

        // Execute actions
        const orderedActions = resolveDependencies(
          decision.actions,
          availableActions,
          executedActions
        );
        for (const actionName of orderedActions) {
          log(`Executing action: ${actionName}`);
          const action = availableActions[actionName];
          if (!action) {
            throw new Error(`Action ${actionName} not found`);
          }
          const result = await action.run({
            ...context,
            store: previousResults || {},
          });
          previousResults = {
            ...previousResults,
            [actionName]: result,
          };
          executedActions.add(actionName);
          log("Action result", { level: "debug", data: previousResults });
        }

        isDone = decision.isDone;
      }

      res.json({
        summary: "Task completed",
        results: previousResults,
      });
    } catch (error) {
      log("Request handler error", { level: "error", data: error });
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return app;
}

export async function runAgentServer(port = DEFAULT_PORT) {
  const config = (await import(path.join(process.cwd(), "spinup.config.ts")))
    .default;
  const app = await createServer(config);
  app.listen(port, () => {
    log(`Spinup server running on port ${port}`);
  });
}
