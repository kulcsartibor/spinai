import { DebugMode, LogOptions } from "../types/debug";

let debugMode: DebugMode = "default";

export function setDebugEnabled(mode: DebugMode = "default") {
  debugMode = mode;
}

function formatDuration(ms: number): string {
  return `${ms}ms`;
}

function formatCost(cents: number): string {
  return `${cents}¢`;
}

function formatMetrics(
  durationMs?: number,
  costCents?: number,
  inputTokens?: number,
  outputTokens?: number,
  executedActions?: string[]
): string {
  const parts = [];
  if (durationMs) parts.push(`took ${formatDuration(durationMs)}`);
  if (costCents) parts.push(`cost ${formatCost(costCents)}`);
  if (inputTokens) parts.push(`input tokens: ${inputTokens}`);
  if (outputTokens) parts.push(`output tokens: ${outputTokens}`);
  if (executedActions?.length) {
    parts.push(`\n   Actions: ${executedActions.join(" → ")}`);
  }
  return parts.length ? ` (${parts.join(", ")})` : "";
}

export function log(message: string, options: LogOptions = {}) {
  const { level = "info", data, type = "action" } = options;

  // In none mode, log nothing
  if (debugMode === "none") {
    return;
  }

  // In default mode, only show start/end summaries and final response
  if (debugMode === "default") {
    if (type === "summary" || type === "response") {
      const icon = type === "summary" ? "📊" : "💬";
      if (data && typeof data === "object") {
        const details = data as Record<string, unknown>;
        const metrics = formatMetrics(
          details.durationMs as number,
          details.costCents as number,
          details.inputTokens as number,
          details.outputTokens as number,
          details.executedActions as string[]
        );
        console.log(`${icon} ${message}${metrics}`);
      } else {
        console.log(`${icon} ${message}`);
      }
    }
    return;
  }

  // Basic logging for verbose and all modes
  if (level === "info") {
    const icon =
      type === "llm"
        ? "🤖"
        : type === "action"
          ? "⚡"
          : type === "summary"
            ? "📊"
            : "💬";

    // For operations with metrics
    if (data && typeof data === "object") {
      const details = data as Record<string, unknown>;
      const metrics = formatMetrics(
        details.durationMs as number,
        details.costCents as number,
        details.inputTokens as number,
        details.outputTokens as number,
        details.executedActions as string[]
      );
      console.log(`${icon} ${message}${metrics}`);

      if (details.reasoning) {
        console.log(`   ${details.reasoning}`);
      }
      return;
    }

    // For simple messages
    console.log(`${icon} ${message}`);
    return;
  }

  // Debug logging for "all" mode
  if (level === "debug" && debugMode === "all") {
    if (data && typeof data === "object") {
      const details = data as Record<string, unknown>;
      if (details.prompt) {
        console.log("\n📝 Prompt:");
        console.log(details.prompt);
      }
    }
  }

  // Error logging for all non-none modes
  if (level === "error") {
    console.error(`❌ ${message}`, data || "");
  }
}
