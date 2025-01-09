import type { LogPayload, StepLogEntry } from "../types/logging";
import { v4 as uuidv4 } from "uuid";

// const LOGGING_ENDPOINT = "https://logs.spinai.dev/log";
const LOGGING_ENDPOINT = "http://0.0.0.0:8000/log";

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

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private async sendLog(step: StepLogEntry): Promise<void> {
    if (!this.agentId || !this.spinApiKey) {
      return;
    }

    const payload: LogPayload = {
      timestamp: this.getTimestamp(),
      agentId: this.agentId,
      sessionId: this.sessionId,
      type: "step",
      data: step,
      spinApiKey: this.spinApiKey,
    };

    console.log(payload.data);
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
      console.error("Failed to send logs to SpinAI", error);
    }
  }

  /** Log user input */
  async logUserInput(input: string, durationMs: number): Promise<void> {
    await this.sendLog({
      id: uuidv4(),
      stepType: "user_input",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      content: { text: input },
      durationMs,
    });
  }

  /** Log the LLM's evaluation decision */
  async logEvaluation(
    input: string,
    reasoning: unknown,
    actions: string[],
    modelUsed: string,
    tokenUsage: Record<string, number>,
    costCents: number,
    durationMs: number
  ): Promise<void> {
    await this.sendLog({
      id: uuidv4(),
      stepType: "evaluation",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      content: { text: input },
      reasoning: { details: reasoning },
      actions,
      modelUsed,
      tokenUsage,
      costCents,
      durationMs,
    });
  }

  /** Log the completion of an action */
  async logActionComplete(
    actionId: string,
    result: unknown,
    durationMs: number
  ): Promise<void> {
    await this.sendLog({
      id: uuidv4(),
      stepType: "action_execution",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      content: { actionId, result },
      status: "completed",
      durationMs,
    });
  }

  /** Log a failed action with an error */
  async logActionError(
    actionId: string,
    error: unknown,
    durationMs: number
  ): Promise<void> {
    await this.sendLog({
      id: uuidv4(),
      stepType: "action_execution",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      content: { actionId },
      status: "failed",
      errorMessage: typeof error === "string" ? error : JSON.stringify(error),
      errorSeverity: "critical",
      errorContext: {
        stack: (error as Error)?.stack || "No stack trace available",
      },
      durationMs,
    });
  }

  /** Log the final response sent to the user */
  async logFinalResponse(
    response: string,
    modelUsed: string,
    tokenUsage: Record<string, number>,
    costCents: number,
    durationMs: number
  ): Promise<void> {
    await this.sendLog({
      id: uuidv4(),
      stepType: "final_response",
      timestamp: this.getTimestamp(),
      sessionId: this.sessionId,
      content: { response },
      modelUsed,
      tokenUsage,
      costCents,
      durationMs,
    });
  }
}
