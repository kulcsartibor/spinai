const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

// Create a simple math MCP server
const server = new McpServer({
  name: "Simple Math MCP",
  version: "1.0.0",
});

// Add basic math operations
server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: "text", text: String(a + b) }],
}));

server.tool("multiply", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: "text", text: String(a * b) }],
}));

server.tool(
  "power",
  { base: z.number(), exponent: z.number() },
  async ({ base, exponent }) => ({
    content: [{ type: "text", text: String(Math.pow(base, exponent)) }],
  })
);

// Start the server using stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
