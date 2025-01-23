import type { Action } from "../types/action";

export function resolveDependencies(
  actionIds: string[],
  availableActions: Action[]
  // executedActions: Set<string>
): string[] {
  const result: string[] = [];
  const visited = new Set<string>();

  function visit(id: string) {
    if (visited.has(id)) return;

    const action = availableActions.find((a) => a.id === id);
    if (!action) {
      console.error("Failed to find action:", {
        searchedId: id,
        availableActionIds: availableActions.map((a) => a.id),
        rawActionIds: actionIds,
      });
      throw new Error(`Action ${id} not found`);
    }

    visited.add(id);

    for (const depId of action.dependsOn || []) {
      visit(depId);
    }

    result.push(id);
  }

  for (const id of actionIds) {
    if (typeof id === "object") {
      console.error("Unexpected object in actionIds:", id);
    }
    visit(typeof id === "object" ? JSON.stringify(id) : id);
  }

  return result;
}
