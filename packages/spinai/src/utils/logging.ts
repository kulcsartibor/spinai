import { log } from "./logger";
import type { LogPayload, LogEntry } from "../types/logging";
import { LLMDecision } from "../types/llm";

const LOGGING_ENDPOINT = "https://logs.spinai.dev/log";

export class LoggingService {
  private agentId?: string;
  private spinApiKey?: string;
  private sessionId: string;
  private startTime: number;

  constructor(config: {
    agentId?: string;
    spinApiKey?: string;
    sessionId: string;
  }) {
    this.agentId = config.agentId;
    this.spinApiKey = config.spinApiKey;
    this.sessionId = config.sessionId;
    this.startTime = Date.now();
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getDuration(): number {
    return Date.now() - this.startTime;
  }

  private async sendLog(
    type: LogPayload["type"],
    data: LogEntry
  ): Promise<void> {
    if (!this.agentId || !this.spinApiKey) {
      return;
    }

    console.log("sendLog", type, data);

    try {
      const payload: LogPayload = {
        timestamp: this.getTimestamp(),
        agentId: this.agentId,
        sessionId: this.sessionId,
        type,
        data,
        spinApiKey: this.spinApiKey,
      };

      const response = await fetch(LOGGING_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.spinApiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to send logs: ${response.statusText}`);
      }
    } catch (error) {
      log("Failed to send logs to SpinAI");
      // log("Failed to send logs to SpinAI", { level: "error", data: error });
    }
  }

  async logDecision(
    input: string,
    decision: LLMDecision,
    prompt?: Record<string, unknown>
  ): Promise<void> {
    await this.sendLog("decision", {
      type: "decision",
      timestamp: this.getTimestamp(),
      duration: this.getDuration(),
      input,
      decision,
      prompt,
    });
  }

  async logActionStart(actionId: string): Promise<void> {
    await this.sendLog("action", {
      type: "action",
      timestamp: this.getTimestamp(),
      actionId,
      status: "started",
    });
  }

  async logActionComplete(actionId: string, result?: unknown): Promise<void> {
    await this.sendLog("action", {
      type: "action",
      timestamp: this.getTimestamp(),
      duration: this.getDuration(),
      actionId,
      status: "completed",
      result,
    });
  }

  async logActionError(actionId: string, error: unknown): Promise<void> {
    await this.sendLog("action", {
      type: "action",
      timestamp: this.getTimestamp(),
      duration: this.getDuration(),
      actionId,
      status: "failed",
      error,
    });
  }

  async logError(error: unknown, context?: unknown): Promise<void> {
    await this.sendLog("error", {
      type: "error",
      timestamp: this.getTimestamp(),
      duration: this.getDuration(),
      error,
      context,
    });
  }

  async logTaskStart(input: string): Promise<void> {
    await this.sendLog("decision", {
      type: "decision",
      timestamp: this.getTimestamp(),
      duration: 0,
      input,
      decision: {
        actions: [],
        isDone: false,
        response: "Task started",
      },
    });
  }
}
