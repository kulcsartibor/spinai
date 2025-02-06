#!/usr/bin/env node
import { Command } from "commander";
import { promises as fs } from "fs";
import * as path from "path";
import degit from "degit";
import chalk from "chalk";
import prompts, { PromptObject } from "prompts";

// Templates are stored in the main repo under packages/templates
const TEMPLATE_REPO = "fallomai/spinai/packages/templates";
const AVAILABLE_TEMPLATES = ["basic", "advanced", "minimal"] as const;

type Template = (typeof AVAILABLE_TEMPLATES)[number];

async function getProjectDetails(suggestedName?: string) {
  const questions: PromptObject[] = [];

  if (!suggestedName) {
    questions.push({
      type: "text",
      name: "projectName",
      message: "What is your project named?",
      initial: "my-spinai-app",
    } as PromptObject);
  }

  questions.push({
    type: "select",
    name: "template",
    message: "Which template would you like to use?",
    choices: AVAILABLE_TEMPLATES.map((t) => ({ title: t, value: t })),
    initial: 0,
  } as PromptObject);

  const response = await prompts(questions, {
    onCancel: () => {
      console.log(chalk.red("✖") + " Operation cancelled");
      process.exit(1);
    },
  });

  return {
    projectName: suggestedName || response.projectName,
    template: response.template as Template,
  };
}

async function setupEnvFile(projectRoot: string) {
  try {
    const envExamplePath = path.join(projectRoot, ".env.example");
    const envPath = path.join(projectRoot, ".env");

    // Check if .env.example exists
    try {
      await fs.access(envExamplePath);
    } catch {
      return; // No .env.example file, skip this step
    }

    // Copy .env.example to .env
    await fs.copyFile(envExamplePath, envPath);
    console.log(chalk.green("✓") + " Created .env file from template");
  } catch (error) {
    console.log(chalk.yellow("⚠") + " Could not set up .env file");
  }
}

async function installDependencies(projectRoot: string) {
  console.log(chalk.yellow("\n⚡ Installing dependencies...\n"));

  const command = "npm install";
  try {
    const { execSync } = await import("child_process");
    execSync(command, {
      cwd: projectRoot,
      stdio: "inherit",
    });
    return true;
  } catch (error) {
    console.error(chalk.red("\n✖ Failed to install dependencies"));
    return false;
  }
}

new Command("create-spinai-app")
  .version("0.1.0")
  .arguments("[project-name]")
  .option("-t, --template <template>", "Template to use")
  .action(async (name, options) => {
    console.log(chalk.bold("\n🤖 Creating a new SpinAI app...\n"));

    // If template is not provided via CLI, or name is missing, prompt for details
    const details = await getProjectDetails(name);
    const template = options.template || details.template;
    const projectName = details.projectName;

    const root = path.resolve(projectName);

    // Ensure the directory is empty or doesn't exist
    try {
      const stats = await fs.stat(root);
      if (stats.isDirectory()) {
        const files = await fs.readdir(root);
        if (files.length > 0) {
          console.log(chalk.red("Error: Directory is not empty"));
          process.exit(1);
        }
      }
    } catch (error) {
      // Directory doesn't exist, which is fine
    }

    console.log(chalk.cyan(`\n📁 Creating project in ${chalk.bold(root)}`));
    console.log(chalk.cyan(`🎨 Using template: ${chalk.bold(template)}\n`));

    try {
      // Create project directory
      await fs.mkdir(root, { recursive: true });

      console.log(chalk.yellow("⚡ Downloading template..."));

      // Clone the template from GitHub
      const emitter = degit(`${TEMPLATE_REPO}/${template}`, {
        cache: false,
        force: true,
        verbose: true,
      });

      await emitter.clone(root);

      // Update package.json
      const pkgPath = path.join(root, "package.json");
      try {
        const pkgContent = await fs.readFile(pkgPath, "utf8");
        const pkg = JSON.parse(pkgContent);
        pkg.name = projectName;
        await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
      } catch (error) {
        // package.json doesn't exist, which is fine for some templates
      }

      // Set up environment variables
      await setupEnvFile(root);

      // Install dependencies
      const installSuccess = await installDependencies(root);

      console.log(chalk.green("\n✨ Project created successfully!\n"));

      console.log(chalk.bold("Next steps:"));

      if (!installSuccess) {
        console.log(chalk.cyan(`  1. cd ${projectName}`));
        console.log(chalk.cyan("  2. npm install"));
      }

      console.log(
        chalk.cyan("  1. Open .env and configure your environment variables")
      );
      console.log(chalk.cyan("  2. Run 'npm run dev' when ready to start\n"));

      console.log(chalk.bold("Learn more:"));
      console.log(
        chalk.blue("  📚 Documentation: ") +
          chalk.underline("https://docs.spinai.dev")
      );
      console.log(
        chalk.blue("  💬 Discord: ") +
          chalk.underline("https://discord.gg/BYsRx36qR3\n")
      );
      console.log(
        chalk.blue("  🪵 Access your bot logs: ") +
          chalk.underline("https://app.spinai.dev\n")
      );
    } catch (error) {
      console.error(chalk.red("\n✖ Failed to create project:"), error);
      process.exit(1);
    }
  })
  .parse();
