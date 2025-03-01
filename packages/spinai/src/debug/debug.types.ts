export type LogLevel = "debug" | "info" | "error";
export type DebugMode = "none" | "default" | "verbose" | "all";
export type LogType = "llm" | "action" | "response" | "summary";

export interface LogOptions {
  level?: "info" | "debug" | "error";
  type?: "llm" | "action" | "summary" | "response" | "action-schedule";
  data?: unknown;
}
