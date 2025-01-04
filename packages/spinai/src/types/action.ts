export interface Action {
  id: string;
  description: string;
  retries?: number;
  dependsOn?: string[];
  run: (context: ActionContext) => Promise<ActionContext>;
}

export interface ActionContext {
  input: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: Record<string, any>;
}
