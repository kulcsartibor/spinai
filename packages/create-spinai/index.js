#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Forward all arguments to create-spinai-app
const createSpinaiApp = join(
  __dirname,
  "node_modules",
  ".bin",
  "create-spinai-app"
);
const child = spawn(createSpinaiApp, process.argv.slice(2), {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code);
});
