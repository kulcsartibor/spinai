import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";
import type { ActionModule } from "../types/action";
import type { BaseOrchestrator } from "../types/orchestrator";

export async function loadActions(
  actionDirectoryPath: string
): Promise<Record<string, ActionModule>> {
  const actions: Record<string, ActionModule> = {};
  const absolutePath = path.resolve(process.cwd(), actionDirectoryPath);
  const actionFiles = await glob("**/*.{ts,js}", { cwd: absolutePath });

  for (const file of actionFiles) {
    const modulePath = path.join(absolutePath, file);
    const module = await import(modulePath);
    if (module.run && module.config) {
      actions[module.config.id] = module;
    }
  }

  return actions;
}

export async function loadOrchestrator(
  orchestratorDirectoryPath: string
): Promise<BaseOrchestrator> {
  const orchestratorFiles = await glob("**/*.{ts,js}", {
    cwd: orchestratorDirectoryPath,
  });

  if (orchestratorFiles.length === 0) {
    throw new Error("No orchestrator found");
  }

  const firstFile = orchestratorFiles[0];
  if (!firstFile) throw new Error("No orchestrator file found");

  const modulePath = path.join(
    process.cwd(),
    orchestratorDirectoryPath,
    firstFile
  );
  const moduleUrl = `file://${modulePath}`;
  const module = await import(moduleUrl);
  return module.default;
}
