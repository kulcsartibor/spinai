export type LogLevel = "debug" | "info" | "error";
export type DebugMode = "none" | "default" | "verbose" | "all";
export type LogType = "llm" | "action" | "response" | "summary";

export interface LogOptions {
  level?: LogLevel;
  data?: unknown;
  type?: LogType;
}
