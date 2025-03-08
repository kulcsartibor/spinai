import { createAction } from "../actions";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { execSync } from "child_process";
import * as path from "path";
import { McpConfig } from "./mcp.types";

/**
 * Creates SpinAI actions from an MCP configuration
 */
export async function createActionsFromMcpConfig(config: McpConfig) {
  const actions = [];

  // Get npm prefix to find npx
  const npmPrefix = execSync("npm prefix -g").toString().trim();
  const npxPath = path.join(npmPrefix, "bin", "npx");

  for (const [mcpName, mcpConfig] of Object.entries(config)) {
    console.log(`Setting up MCP: ${mcpName}`);

    // Create MCP client
    const client = new Client(
      {
        name: `SpinAI ${mcpName} Client`,
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Map environment variables if mappings are provided
    const mappedEnv: Record<string, string> = {};
    if (mcpConfig.envMapping) {
      for (const [envVar, mcpVar] of Object.entries(mcpConfig.envMapping)) {
        if (process.env[envVar]) {
          mappedEnv[mcpVar] = process.env[envVar] as string;
        }
      }
    }

    // Create args array with config
    const args = [...mcpConfig.args];
    if (Object.keys(mappedEnv).length > 0) {
      args.push("--config", JSON.stringify(mappedEnv));
    }

    // Create transport with full npx path
    const transport = new StdioClientTransport({
      command: mcpConfig.command === "npx" ? npxPath : mcpConfig.command,
      args,
      env: {
        ...mcpConfig.env,
        ...(Object.fromEntries(
          Object.entries(process.env).filter(([_, v]) => v !== undefined)
        ) as Record<string, string>),
      },
    });

    try {
      // Connect to MCP
      await client.connect(transport);
      const tools = await client.listTools();
      // console.log("Raw tools response:", JSON.stringify(tools, null, 2));

      // Extract tools array from response
      const toolsArray = tools.tools || [];

      if (Array.isArray(toolsArray)) {
        // Create a SpinAI action for each tool
        for (const tool of toolsArray) {
          const action = createAction({
            id: `${mcpName}_${tool.name}`,
            description:
              tool.description || `${mcpName} ${tool.name} operation`,
            parameters: tool.inputSchema as {
              type: "object";
              properties: Record<string, unknown>;
              required?: string[];
            },
            async run({ parameters }) {
              try {
                const result = await client.callTool({
                  name: tool.name,
                  arguments: parameters,
                });

                // Extract result from MCP response
                if (result?.content) {
                  return result.content;
                }
                return JSON.stringify(result);
              } catch (error) {
                console.error(`Error calling ${mcpName} ${tool.name}:`, error);
                throw error;
              }
            },
          });

          actions.push(action);
        }
      }
    } catch (error) {
      console.error(`Error setting up ${mcpName}:`, error);
      throw error;
    }
  }

  return actions;
}
