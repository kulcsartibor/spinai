import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Agent, Messages } from "spinai";

export interface SpinAgentConfig {
  agent: Agent;
  path: string;
  name?: string;
  description?: string;
  responseSchema?: unknown;
}

export interface ServerConfig {
  port?: number;
  host?: string;
  cors?: boolean | object;
}

export interface SpinConfig {
  server?: ServerConfig;
  agents: SpinAgentConfig[];
}

/**
 * Start a server for SpinAI agents based on the provided configuration
 * @param config The SpinAI server configuration
 * @returns A promise that resolves when the server is started
 */
export async function startServer(config: SpinConfig): Promise<void> {
  if (
    !config.agents ||
    !Array.isArray(config.agents) ||
    config.agents.length === 0
  ) {
    throw new Error(
      'Invalid configuration. You must provide at least one agent in the "agents" array.'
    );
  }

  // Create Hono app
  const app = new Hono();

  // Apply CORS if enabled
  if (config.server?.cors) {
    // Simply enable CORS with default settings (allow all origins)
    // This avoids TypeScript errors with the CORSOptions type
    app.use(cors());
  }

  // Session storage - maps agent path and session ID to message histories
  const sessions = new Map<string, Map<string, Messages>>();

  // Create endpoints for each agent
  for (const agentConfig of config.agents) {
    const { agent, path: agentPath, name, description } = agentConfig;
    const endpoint = `/api/${agentPath}`;

    console.log(
      `📝 Creating endpoint for ${name || agentPath}: ${endpoint}${description ? ` - ${description}` : ""}`
    );

    // Initialize session storage for this agent
    sessions.set(agentPath, new Map());

    // Create API endpoint
    app.post(endpoint, async (c) => {
      try {
        const body = await c.req.json();
        const { input, sessionId = "default", responseFormat } = body;

        if (!input || typeof input !== "string") {
          return c.json(
            { error: "Input is required and must be a string" },
            400
          );
        }

        // Get or create session
        const agentSessions = sessions.get(agentPath)!;
        const messages = agentSessions.get(sessionId) || [];

        console.log(`📨 Received message for ${name || agentPath}: "${input}"`);

        // Run the agent
        const result = await agent({
          input,
          messages,
          ...(responseFormat ? { responseFormat } : {}),
        });

        // Store updated messages
        agentSessions.set(sessionId, result.messages);

        // Return the response
        return c.json({
          response: result.response,
          sessionId,
        });
      } catch (error) {
        console.error(
          `❌ Error processing request for ${name || agentPath}:`,
          error
        );
        return c.json(
          { error: "An error occurred while processing your request" },
          500
        );
      }
    });
  }

  // Add an index endpoint that lists all available agents
  app.get("/", (c) => {
    const agentList = config.agents.map(({ path, name, description }) => ({
      path: `/api/${path}`,
      name: name || path,
      description: description || `SpinAI agent at /api/${path}`,
    }));

    return c.json({
      message: "SpinAI Server",
      agents: agentList,
    });
  });

  // Start the server
  const port = config.server?.port || 3000;
  const host = config.server?.host || "localhost";

  console.log(`🚀 Starting SpinAI server on ${host}:${port}...`);

  await serve({
    fetch: app.fetch,
    port,
    hostname: host,
  });

  console.log(`
🚀 Your SpinAI server is now running at http://${host}:${port}

Available endpoints:
${config.agents
  .map(({ path, name }) => {
    return `  - ${name || path}: http://${host}:${port}/api/${path}`;
  })
  .join("\n")}

To interact with an agent, send POST requests to its endpoint with:
  { "input": "Your message here", "sessionId": "optional-session-id" }

Press Ctrl+C to stop the server
`);
}
