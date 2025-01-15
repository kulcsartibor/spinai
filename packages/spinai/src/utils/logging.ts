import type {
  LogPayload,
  StepLogEntry,
  InteractionLogEntry,
} from "../types/logging";
import { v4 as uuidv4 } from "uuid";

// const LOGGING_ENDPOINT = "https://logs.spinai.dev/log";
const LOGGING_ENDPOINT = "http://0.0.0.0:8000/log";

export class LoggingService {
  private agentId?: string;
  private spinApiKey?: string;
  private sessionId: string;
  private interactionId: string;
  private llmModel: string;
  private startTime: number;
  private totalCostCents: number = 0;
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;
  private logQueue: Array<{
    type: "step" | "interaction";
    data: StepLogEntry | InteractionLogEntry;
    retryCount: number;
  }> = [];
  private isProcessingQueue = false;
  private readonly MAX_RETRIES = 3;
  private lastErrorTime: number = 0;
  private readonly ERROR_COOLDOWN_MS = 5000; // Only show error every 5 seconds
  private originalInput: string = "";

  constructor(config: {
    agentId?: string;
    spinApiKey?: string;
    sessionId: string;
    interactionId: string;
    llmModel: string;
  }) {
    this.agentId = config.agentId;
    this.spinApiKey = config.spinApiKey;
    this.sessionId = config.sessionId;
    this.interactionId = config.interactionId;
    this.llmModel = config.llmModel;
    this.startTime = Date.now();
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private logError(message: string): void {
    const now = Date.now();
    if (now - this.lastErrorTime > this.ERROR_COOLDOWN_MS) {
      console.error(`SpinAI Logging: ${message}`);
      this.lastErrorTime = now;
    }
  }

  private async processLogQueue(): Promise<void> {
    if (this.isProcessingQueue || !this.logQueue.length) return;

    this.isProcessingQueue = true;
    while (this.logQueue.length > 0) {
      const log = this.logQueue[0];
      try {
        await this.sendLog(log.type, log.data);
        this.logQueue.shift();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorSnippet =
          errorMsg.length > 20 ? errorMsg.slice(0, 20) + "..." : errorMsg;

        log.retryCount += 1;
        if (log.retryCount >= this.MAX_RETRIES) {
          this.logError(
            `Failed to send logs after ${this.MAX_RETRIES} attempts (${errorSnippet}). Some logs may be lost.`
          );
          this.logQueue.shift();
        } else {
          this.logError(
            `Log delivery failed (${errorSnippet}), will retry (attempt ${log.retryCount}/${this.MAX_RETRIES})`
          );
        }
        break;
      }
    }
    this.isProcessingQueue = false;
  }

  private queueLog(
    type: "step" | "interaction",
    data: StepLogEntry | InteractionLogEntry
  ): void {
    this.logQueue.push({ type, data, retryCount: 0 });
    // Start processing queue but don't await it
    this.processLogQueue().catch(console.error);
  }

  private async sendLog(
    type: "step" | "interaction",
    data: StepLogEntry | InteractionLogEntry
  ): Promise<void> {
    if (!this.agentId || !this.spinApiKey) {
      return;
    }

    const payload: LogPayload = {
      timestamp: this.getTimestamp(),
      agentId: this.agentId,
      sessionId: this.sessionId,
      interactionId: this.interactionId,
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
  }
  /** Start a new interaction */
  logInteractionStart(input: string): void {
    this.originalInput = input;
    const interactionStart: InteractionLogEntry = {
      id: this.interactionId,
      sessionId: this.sessionId,
      inputText: input,
      modelUsed: this.llmModel,
      timestamp: this.getTimestamp(),
    };
    this.queueLog("interaction", interactionStart);
  }

  /** Complete an interaction */
  logInteractionComplete(
    response: unknown,
    durationMs?: number,
    error?: Error
  ): void {
    this.queueLog("interaction", {
      id: this.interactionId,
      sessionId: this.sessionId,
      inputText: this.originalInput,
      inputTokens: this.totalInputTokens,
      outputTokens: this.totalOutputTokens,
      costCents: this.totalCostCents,
      durationMs: durationMs || Date.now() - this.startTime,
      modelUsed: this.llmModel,
      status: error ? "failed" : "success",
      errorMessage: error?.message,
      response,
    } as InteractionLogEntry);
  }

  /** Log the LLM's evaluation decision */
  logEvaluation(
    state: Record<string, unknown>,
    reasoning: string,
    actions: string[],
    modelUsed: string,
    inputTokens: number,
    outputTokens: number,
    costCents: number,
    durationMs: number,
    response: unknown,
    rawInput?: Record<string, unknown>,
    rawOutput?: Record<string, unknown>
  ): void {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    this.totalCostCents += costCents;

    this.queueLog("step", {
      id: uuidv4(),
      stepType: "evaluation",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: state,
      reasoning,
      actions,
      modelUsed,
      inputTokens,
      outputTokens,
      costCents,
      durationMs,
      response,
      rawInput,
      rawOutput,
    } as StepLogEntry);
  }

  /** Log the completion of an action */
  logActionComplete(
    actionId: string,
    state: Record<string, unknown>,
    durationMs: number,
    result: unknown
  ): void {
    this.queueLog("step", {
      id: uuidv4(),
      stepType: "action_execution",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: state,
      actions: [actionId],
      status: "completed",
      durationMs,
      costCents: 0,
      response: result,
    } as StepLogEntry);
  }

  /** Log a failed action with an error */
  logActionError(
    actionId: string,
    error: unknown,
    state: Record<string, unknown>,
    durationMs: number
  ): void {
    this.queueLog("step", {
      id: uuidv4(),
      stepType: "action_execution",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: state,
      actions: [actionId],
      status: "failed",
      errorMessage: typeof error === "string" ? error : JSON.stringify(error),
      errorSeverity: "critical",
      errorContext: {
        stack: (error as Error)?.stack || "No stack trace available",
      },
      durationMs,
      costCents: 0,
      response: error,
    } as StepLogEntry);
  }

  /** Get total metrics for the interaction */
  getMetrics(): { totalCostCents: number; totalDurationMs: number } {
    return {
      totalCostCents: this.totalCostCents,
      totalDurationMs: Date.now() - this.startTime,
    };
  }
}
