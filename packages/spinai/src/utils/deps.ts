import { Action } from "../types/action";

export function resolveDependencies(
  actionIds: string[],
  actions: Action[]
): string[] {
  const actionMap = new Map(actions.map((a) => [a.id, a]));
  const result: string[] = [];
  const visited = new Set<string>();

  function visit(id: string) {
    if (visited.has(id)) return;

    const action = actionMap.get(id);
    if (!action) return;

    visited.add(id);

    // Visit dependencies first
    for (const depId of action.dependsOn || []) {
      visit(depId);
    }

    result.push(id);
  }

  for (const id of actionIds) {
    visit(id);
  }

  return result;
}
