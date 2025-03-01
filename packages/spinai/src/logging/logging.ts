import type {
  LogPayload,
  StepLogEntry,
  InteractionLogEntry,
  InteractionSummary,
} from "./logging.types";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_LOGGING_ENDPOINT = "https://logs.spinai.dev/log";

export class LoggingService {
  private agentId?: string;
  private spinApiKey?: string;
  private sessionId: string;
  private interactionId: string;
  private llmModel: string;
  private externalCustomerId?: string;
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
  private isRerun: boolean;
  private loggingEndpoint: string;

  constructor(config: {
    agentId?: string;
    spinApiKey?: string;
    sessionId: string;
    interactionId: string;
    llmModel: string;
    externalCustomerId?: string;
    isRerun?: boolean;
    loggingEndpoint?: string;
  }) {
    this.agentId = config.agentId;
    this.spinApiKey = config.spinApiKey;
    this.sessionId = config.sessionId;
    this.interactionId = config.interactionId;
    this.llmModel = config.llmModel;
    this.externalCustomerId = config.externalCustomerId;
    this.isRerun = config.isRerun ?? false;
    this.startTime = Date.now();
    this.loggingEndpoint = config.loggingEndpoint ?? DEFAULT_LOGGING_ENDPOINT;
    console.log(this.loggingEndpoint);
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

        log.retryCount += 1;
        if (log.retryCount >= this.MAX_RETRIES) {
          this.logError(
            `Failed to send logs after ${this.MAX_RETRIES} attempts (${errorMsg}). Some logs may be lost.`
          );
          this.logQueue.shift();
        } else {
          this.logError(
            `Log delivery failed (${errorMsg}), will retry (attempt ${log.retryCount}/${this.MAX_RETRIES})`
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
      externalCustomerId: this.externalCustomerId,
    };

    // Debug logging
    // console.log(`\n📝 Sending ${type} log:`, JSON.stringify(payload, null, 2));

    const response = await fetch(this.loggingEndpoint, {
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
    // Log interaction entry
    const interactionStart: InteractionLogEntry = {
      id: this.interactionId,
      sessionId: this.sessionId,
      inputText: input,
      modelUsed: this.llmModel,
      timestamp: this.getTimestamp(),
      isRerun: this.isRerun,
    };
    this.queueLog("interaction", interactionStart);

    // Log interaction start step
    this.queueLog("step", {
      id: uuidv4(),
      stepType: "interaction_start",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: {},
      status: "completed",
      modelUsed: this.llmModel,
    } as StepLogEntry);
  }

  /** Complete an interaction */
  logInteractionComplete(
    response: unknown,
    durationMs?: number,
    error?: Error,
    interactionState?: InteractionSummary
  ): void {
    // Log interaction complete step first
    this.queueLog("step", {
      id: uuidv4(),
      stepType: "interaction_complete",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: {},
      status: error ? "failed" : "completed",
      durationMs,
      errorMessage: error?.message,
      response,
      interactionState,
    } as StepLogEntry);

    // Then log final interaction entry
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
      interactionState,
      timestamp: this.getTimestamp(),
      isRerun: this.isRerun,
    } as InteractionLogEntry);
  }

  /** Log the LLM's evaluation for planning next actions */
  logPlanNextActions(
    state: Record<string, unknown>,
    reasoning: string,
    plannedActions: string[],
    modelUsed: string,
    inputTokens: number,
    outputTokens: number,
    costCents: number,
    durationMs: number,
    response: unknown,
    rawInput?: string,
    rawOutput?: string
  ): void {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    this.totalCostCents += costCents;

    this.queueLog("step", {
      id: uuidv4(),
      stepType: "plan_next_actions",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: state,
      reasoning,
      plannedActions,
      modelUsed,
      inputTokens,
      outputTokens,
      costCents,
      durationMs,
      response,
      status: "completed",
      rawInput,
      rawOutput,
    } as StepLogEntry);
  }

  /** Log the LLM's evaluation for planning action parameters */
  logPlanActionParameters(
    actionId: string,
    parameters: Record<string, unknown>,
    state: Record<string, unknown>,
    reasoning: string,
    modelUsed: string,
    inputTokens: number,
    outputTokens: number,
    costCents: number,
    durationMs: number,
    response: unknown,
    rawInput?: string,
    rawOutput?: string
  ): void {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    this.totalCostCents += costCents;

    this.queueLog("step", {
      id: uuidv4(),
      stepType: "plan_action_parameters",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: state,
      reasoning,
      targetActionId: actionId,
      actionParameters: parameters,
      modelUsed,
      inputTokens,
      outputTokens,
      costCents,
      durationMs,
      response,
      status: "completed",
      rawInput,
      rawOutput,
    } as StepLogEntry);
  }

  /** Log the completion of an action */
  logActionComplete(
    actionId: string,
    state: Record<string, unknown>,
    durationMs: number,
    result: unknown,
    error?: { message: string }
  ): void {
    this.queueLog("step", {
      id: uuidv4(),
      stepType: "execute_action",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: state,
      executedActionId: actionId,
      actionResult: result,
      status: error ? "failed" : "completed",
      durationMs,
      costCents: 0,
      errorMessage: error?.message,
    } as StepLogEntry);
  }

  /** Log the LLM's evaluation for planning the final response */
  logPlanFinalResponse(
    state: Record<string, unknown>,
    reasoning: string,
    modelUsed: string,
    inputTokens: number,
    outputTokens: number,
    costCents: number,
    durationMs: number,
    response: unknown,
    rawInput?: string,
    rawOutput?: string
  ): void {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    this.totalCostCents += costCents;

    this.queueLog("step", {
      id: uuidv4(),
      stepType: "plan_final_response",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: state,
      reasoning,
      modelUsed,
      inputTokens,
      outputTokens,
      costCents,
      durationMs,
      response,
      status: "completed",
      rawInput,
      rawOutput,
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
      stepType: "execute_action",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      interactionId: this.interactionId,
      context: state,
      executedActionId: actionId,
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
