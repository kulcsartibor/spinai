#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { startServer, SpinConfig } from "../index";

async function main() {
  try {
    // Get the current working directory
    const cwd = process.cwd();

    // Look for spin.config.js or spin.config.ts
    const configPath = findConfigFile(cwd);

    if (!configPath) {
      console.error(
        "❌ Could not find a spin.config.js or spin.config.ts file."
      );
      console.error("Please create one and export your configuration.");
      console.error("Example:");
      console.error(`
// spin.config.js
const { calculatorAgent } = require('./src/index');

module.exports = {
  server: { port: 3000 },
  agents: [
    {
      agent: calculatorAgent,
      path: 'calculator',
      name: 'Calculator'
    }
  ]
};
      `);
      process.exit(1);
    }

    console.log(`📝 Found config file: ${configPath}`);

    // Import the config file
    let config: SpinConfig;

    try {
      const module = await import(configPath);
      config = module.default;

      if (!config || !config.agents || !Array.isArray(config.agents)) {
        throw new Error(
          'Invalid configuration. Make sure you export a default object with an "agents" array.'
        );
      }

      if (config.agents.length === 0) {
        throw new Error(
          'No agents defined in configuration. Add at least one agent to the "agents" array.'
        );
      }

      // Validate each agent config
      for (const agentConfig of config.agents) {
        if (!agentConfig.agent || typeof agentConfig.agent !== "function") {
          throw new Error(
            `Invalid agent in configuration. Each agent must have an "agent" property that is a function.`
          );
        }

        if (!agentConfig.path || typeof agentConfig.path !== "string") {
          throw new Error(
            `Invalid path in configuration. Each agent must have a "path" property that is a string.`
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Error loading configuration:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }

    console.log(
      `✅ Successfully loaded configuration with ${config.agents.length} agent(s)`
    );

    // Start the server with the loaded configuration
    await startServer(config);
  } catch (error) {
    console.error(
      "❌ Error starting SpinAI server:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

/**
 * Find the spin.config.js or spin.config.ts file in the given directory
 */
function findConfigFile(dir: string): string | null {
  const configFiles = [
    path.join(dir, "spin.config.js"),
    path.join(dir, "spin.config.ts"),
    path.join(dir, "spin.config.mjs"),
    path.join(dir, "spin.config.cjs"),
  ];

  for (const file of configFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  return null;
}

main().catch(console.error);
