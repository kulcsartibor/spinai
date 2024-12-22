export interface ActionContext {
  request: {
    input: string;
    metadata?: Record<string, any>;
  };
  store: Record<string, any>;
  actions: Record<string, ActionModule>;
}

export interface ActionConfig {
  id: string;
  retries?: number;
  dependsOn?: string[];
  allowRerun?: boolean;
  metadata?: {
    description?: string;
    [key: string]: any;
  };
}

export interface ActionModule {
  run: (context: ActionContext) => Promise<any>;
  config: ActionConfig;
}
