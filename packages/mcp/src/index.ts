#!/usr/bin/env node
import { Command } from "commander";
import { promises as fs } from "fs";
import { existsSync } from "fs";
import * as path from "path";
import chalk from "chalk";
import { execSync } from "child_process";

// Remove punycode deprecation warning
process.removeAllListeners("warning");
process.on("warning", (warning) => {
  if (
    warning.name === "DeprecationWarning" &&
    warning.message.includes("punycode")
  ) {
    return;
  }
  console.warn(warning);
});

const program = new Command();

program
  .name("spinai-mcp")
  .version("1.0.0")
  .description("MCP package manager for SpinAI");

program
  .command("install")
  .description("Install one or more MCP packages")
  .argument(
    "<packages...>",
    "MCP packages to install (e.g., @smithery-ai/github)"
  )
  .action(async (packages: string[]) => {
    console.log(chalk.bold("\n🤖 Installing MCP packages...\n"));

    try {
      // Create or update mcp-config.js
      const mcpConfigPath = path.join(process.cwd(), "mcp-config.js");
      let configContent = "";

      if (existsSync(mcpConfigPath)) {
        console.log(
          chalk.yellow("\n📝 Updating existing MCP configuration...")
        );
      } else {
        console.log(chalk.yellow("\n📝 Creating new MCP configuration..."));
        configContent = `// SpinAI MCP Configuration
export default {
`;
      }

      // Add new package configurations
      for (const pkg of packages) {
        const pkgId = pkg.replace("@", "").replace("/", "_").replace("-", "_");

        // Use Smithery's CLI to run the MCP
        const newConfig = `  ${pkgId}: {
    command: "npx",
    args: ["-y", "@smithery/cli@latest", "run", "${pkg}"],
    env: {}
  },\n`;

        if (existsSync(mcpConfigPath)) {
          // Read existing config and append new package if not present
          const existingConfig = await fs.readFile(mcpConfigPath, "utf8");
          if (!existingConfig.includes(pkgId)) {
            const insertPoint = existingConfig.lastIndexOf("}");
            configContent =
              existingConfig.slice(0, insertPoint) +
              newConfig +
              existingConfig.slice(insertPoint);
            await fs.writeFile(mcpConfigPath, configContent);
          }
        } else {
          // Add to new config
          configContent += newConfig;
        }
      }

      // Close the config object if it's a new file
      if (!existsSync(mcpConfigPath)) {
        configContent += "};\n";
        await fs.writeFile(mcpConfigPath, configContent);
      }

      console.log(chalk.green("\n✨ MCP packages configured successfully!\n"));

      // Show next steps
      console.log(chalk.bold("Next steps:"));
      console.log(chalk.cyan("\n1. Import your MCP configuration:"));
      console.log(chalk.cyan('   import mcpConfig from "./mcp-config.js";\n'));

      console.log(chalk.cyan("2. Create actions from your MCPs:"));
      console.log(
        chalk.cyan(
          "   const actions = await createActionsFromMcpConfig(mcpConfig);\n"
        )
      );

      console.log(chalk.cyan("3. Use the actions in your agent:"));
      console.log(
        chalk.cyan(
          '   const agent = createAgent({\n     instructions: "Use MCP tools",\n     actions,\n     model: openai("gpt-4")\n   });\n'
        )
      );

      console.log(chalk.bold("Configured MCPs:"));
      for (const pkg of packages) {
        console.log(chalk.cyan(`  • ${pkg}`));
      }
      console.log();
    } catch (error) {
      console.error(chalk.red("\n✖ Failed to configure MCP packages:"), error);
      process.exit(1);
    }
  });

program.parse();
