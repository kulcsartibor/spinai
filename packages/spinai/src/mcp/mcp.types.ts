export interface McpConfig {
  [key: string]: {
    command: string;
    args: string[];
    env: Record<string, string>;
    envMapping?: Record<string, string>; // Map from local env vars to MCP-expected vars
  };
}
