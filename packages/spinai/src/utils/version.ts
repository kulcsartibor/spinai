/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Gets the current package version
 * @returns The package version string
 */
export function getPackageVersion(): string {
  try {
    return require("../package.json").version;
  } catch {
    try {
      // Synchronously try require from both paths
      return require("../../package.json").version;
    } catch {
      // If both requires fail, return unknown
      // We could do async imports here but it complicates the API for minimal benefit
      return "unknown";
    }
  }
}
