import {
  Agent,
  AgentConfig,
  AgentRunConfig,
  InferResponseType,
} from "./agents.types";
import { runTaskLoop } from "../taskloop";
import { z } from "zod";

export function createAgent<T extends "text" | z.ZodType<any> = "text">(
  config: AgentConfig
): Agent<T> {
  const agent = async function agent<
    TResponseFormat extends T | "text" | z.ZodType<any> = T,
  >(runConfig: AgentRunConfig<TResponseFormat>) {
    return runTaskLoop<TResponseFormat, InferResponseType<TResponseFormat>>({
      ...config,
      ...runConfig,
    });
  };

  return agent;
}
