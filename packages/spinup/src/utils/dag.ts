import type { ActionModule } from "../types/action";

export function resolveDependencies(
  actionNames: string[],
  availableActions: Record<string, ActionModule>,
  executedActions: Set<string> = new Set()
): string[] {
  const resolved: string[] = [];
  const visiting = new Set<string>();

  function visit(actionName: string) {
    const action = availableActions[actionName];
    if (!action) {
      throw new Error(`Action not found: ${actionName}`);
    }

    // Skip if already executed and rerunning is not allowed
    if (executedActions.has(actionName) && action.config.allowRerun === false) {
      return;
    }

    // Check for circular dependencies
    if (visiting.has(actionName)) {
      throw new Error(`Circular dependency detected: ${actionName}`);
    }

    // Skip if already resolved in this batch
    if (resolved.includes(actionName)) {
      return;
    }

    visiting.add(actionName);

    // First resolve dependencies
    const deps = action.config.dependsOn || [];
    for (const dep of deps) {
      visit(dep);
    }

    visiting.delete(actionName);
    resolved.push(actionName);
  }

  // Visit each requested action
  for (const actionName of actionNames) {
    visit(actionName);
  }

  // Filter out already executed actions
  return resolved.filter((action) => !executedActions.has(action));
}
