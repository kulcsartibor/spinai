/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Gets the current package version
 * @returns The package version string
 */
export function getPackageVersion(): string {
  try {
    // Use require to get package.json - Node will resolve this correctly
    // even when the package is installed as a dependency
    const pkg = require("../../../package.json");
    return pkg.version || "unknown";
  } catch (error) {
    console.error("Error reading package version:", error);
    return "unknown";
  }
}
