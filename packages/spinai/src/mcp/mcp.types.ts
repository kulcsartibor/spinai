export interface McpConfig {
  [key: string]: {
    command: string;
    args: string[];
    envMapping?: Record<string, string>; // Map from local env vars to MCP-expected vars
  };
}
