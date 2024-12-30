#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import spawn from "cross-spawn";

// When packaged, templates are in the same directory as the compiled index.js
const templatesDir = path.join(__dirname, "templates");
const templates = fs.readdirSync(templatesDir);

new Command("create-spinai-app")
  .version("0.1.0")
  .arguments("<project-name>")
  .option(
    "-t, --template <template>",
    "Template to use",
    templates.includes("basic") ? "basic" : templates[0]
  )
  .action((name, options) => {
    const template = options.template;
    if (!templates.includes(template)) {
      console.error(
        `Template "${template}" not found. Available templates: ${templates.join(", ")}`
      );
      process.exit(1);
    }

    const root = path.resolve(name);
    const templateDir = path.join(templatesDir, template);

    // Create project directory
    fs.mkdirSync(root, { recursive: true });

    // Copy template
    copyDir(templateDir, root);

    // Update package.json
    const pkgPath = path.join(root, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = name;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // Install dependencies
    spawn.sync("npm", ["install"], { stdio: "inherit", cwd: root });

    console.log(`
Project created successfully!

  cd ${name}
  npm run dev
`);
  })
  .parse();

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? copyDir(srcPath, destPath)
      : fs.copyFileSync(srcPath, destPath);
  }
}
