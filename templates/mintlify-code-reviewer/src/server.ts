import { createDocUpdateAgent } from "./index";

console.log("Starting documentation update server...");

createDocUpdateAgent({
  config: {
    docsRepo: {
      owner: "AtotheY",
      repo: "mintlify-pr-test",
      monorepo: true,
    },
    docsDir: "apps/docs",
    matchRules: {
      docExtensions: [".mdx", ".md"],
      pathMappings: {
        "packages/": "docs/api",
        "examples/": "docs/examples",
      },
      ignorePatterns: ["**/node_modules/**", "**/.git/**"],
    },
    prConfig: {
      updateOriginalPr: false,
      branchPrefix: "docs/update",
      titleTemplate: "📚 Update documentation for {prTitle}",
      labels: ["documentation"],
    },
  },
});
