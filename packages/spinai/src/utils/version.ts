/**
 * Utility to get the current package version from package.json
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

/**
 * Gets the current package version by reading directly from package.json
 * @returns The package version string
 */
export function getPackageVersion(): string {
  try {
    // Convert the URL to a file path and navigate to the package.json
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Go up multiple directories to find the package.json (src/utils -> src -> package root)
    const packagePath = resolve(__dirname, "../../package.json");

    // Read and parse package.json
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    return packageJson.version || "unknown";
  } catch (error) {
    // Fallback version if we can't read the file for some reason
    console.error("Error reading package version:", error);
    return "unknown";
  }
}
