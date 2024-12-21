export interface ActionContext {
  input: Record<string, any>;
  availableActions: Record<string, ActionModule>;
}

export interface ActionConfig {
  id: string;
  retries?: number;
  dependsOn?: string[];
  metadata?: {
    description?: string;
    [key: string]: any;
  };
}

export interface ActionModule {
  run: (context: ActionContext) => Promise<any>;
  config: ActionConfig;
}
