type LogLevel = "debug" | "info" | "error";

interface LogOptions {
  level?: LogLevel;
  data?: unknown;
}

let isDebugEnabled = true;

export function setDebugEnabled(enabled: boolean) {
  isDebugEnabled = enabled;
}

export function log(message: string, options: LogOptions = {}) {
  if (!isDebugEnabled) return;

  const { level = "info", data } = options;

  switch (level) {
    case "debug":
      console.log(`🔍 DEBUG: ${message}`, data || "");
      break;
    case "info":
      console.log(`ℹ️ INFO: ${message}`, data || "");
      break;
    case "error":
      console.error(`❌ ERROR: ${message}`, data || "");
      break;
  }
}
