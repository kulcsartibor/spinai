import { createAction } from "spinai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

type McpConfig = {
  command: string;
  args?: string[];
  env?: Record<string, string>;
};

type McpServerConfig = {
  [key: string]: McpConfig;
};

/**
 * Creates SpinAI actions from an MCP configuration
 */
export async function createActionsFromMcpConfig(config: McpServerConfig) {
  const actions = [];

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

    // Create transport
    const transport = new StdioClientTransport({
      command: mcpConfig.command,
      args: mcpConfig.args || [],
      env: mcpConfig.env,
    });

    try {
      // Connect to MCP
      console.log("Connecting to MCP server...");
      await client.connect(transport);
      console.log("Connected successfully!");

      // Get available tools
      console.log("Fetching tools...");
      const tools = await client.listTools();
      console.log("Raw tools response:", JSON.stringify(tools, null, 2));

      // Extract tools array from response
      const toolsArray = tools.tools || [];

      if (Array.isArray(toolsArray)) {
        // Create a SpinAI action for each tool
        for (const tool of toolsArray) {
          console.log(`Creating action for tool: ${tool.name}`, {
            id: `${mcpName}_${tool.name}`,
            description:
              tool.description || `${mcpName} ${tool.name} operation`,
            schema: tool.inputSchema,
          });

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
                console.log(
                  `Running ${mcpName}_${tool.name} with parameters:`,
                  parameters
                );
                const result = await client.callTool({
                  name: tool.name,
                  arguments: parameters,
                });
                console.log(`Got result from ${tool.name}:`, result);

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

      console.log(
        "Created actions:",
        actions.map((a) => a.id)
      );
    } catch (error) {
      console.error(`Error setting up ${mcpName}:`, error);
      throw error;
    }
  }

  return actions;
}

// Example usage:
const mcpConfig = {
  math: {
    command: "node",
    args: ["../simple-math-mcp/index.js"],
  },
};

export async function getMathMcpActions() {
  return createActionsFromMcpConfig(mcpConfig);
}
