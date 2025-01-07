import { log } from "./logger";
import type { LogPayload } from "../types/logging";

const LOGGING_ENDPOINT = "https://logs.spinai.dev/log";

export class LoggingService {
  private agentId?: string;
  private spinApiKey?: string;
  private sessionId: string;

  constructor(config: {
    agentId?: string;
    spinApiKey?: string;
    sessionId: string;
  }) {
    this.agentId = config.agentId;
    this.spinApiKey = config.spinApiKey;
    this.sessionId = config.sessionId;
  }

  private async sendLog(payload: LogPayload): Promise<void> {
    if (!this.agentId || !this.spinApiKey) {
      return;
    }

    try {
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
      log("Failed to send logs to SpinAI", { level: "error", data: error });
    }
  }

  async logDecision(decision: unknown): Promise<void> {
    await this.sendLog({
      timestamp: new Date().toISOString(),
      agentId: this.agentId!,
      sessionId: this.sessionId,
      type: "decision",
      data: decision,
      spinApiKey: this.spinApiKey!,
    });
  }

  async logAction(actionData: unknown): Promise<void> {
    await this.sendLog({
      timestamp: new Date().toISOString(),
      agentId: this.agentId!,
      sessionId: this.sessionId,
      type: "action",
      data: actionData,
      spinApiKey: this.spinApiKey!,
    });
  }

  async logError(error: unknown): Promise<void> {
    await this.sendLog({
      timestamp: new Date().toISOString(),
      agentId: this.agentId!,
      sessionId: this.sessionId,
      type: "error",
      data: error,
      spinApiKey: this.spinApiKey!,
    });
  }
}
