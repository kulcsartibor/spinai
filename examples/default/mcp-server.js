const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

// Create an MCP server
const server = new McpServer({
  name: "Calculator Server",
  version: "1.0.0",
});

// Add a sum tool
server.tool("sum", { a: z.number(), b: z.number() }, async ({ a, b }) => {
  console.error(`MCP Sum Tool: Adding ${a} + ${b}`);
  const result = a + b;
  return {
    content: [{ type: "text", text: String(result) }],
  };
});

// Add a multiply tool
server.tool("multiply", { a: z.number(), b: z.number() }, async ({ a, b }) => {
  console.error(`MCP Multiply Tool: Multiplying ${a} * ${b}`);
  const result = a * b;
  return {
    content: [{ type: "text", text: String(result) }],
  };
});

console.error("Starting MCP Calculator Server...");

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server
  .connect(transport)
  .then(() => {
    console.error("MCP Calculator Server connected and ready");
  })
  .catch((err) => {
    console.error("Error starting MCP Calculator Server:", err);
  });
