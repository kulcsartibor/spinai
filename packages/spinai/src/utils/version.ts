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
    let packagePath: string;

    // Handle both ESM and CommonJS environments
    if (typeof __dirname !== "undefined") {
      // CommonJS
      packagePath = resolve(__dirname, "../../package.json");
    } else if (typeof import.meta !== "undefined") {
      // ESM
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      packagePath = resolve(__dirname, "../../package.json");
    } else {
      throw new Error("Unable to determine module environment");
    }

    // Read and parse package.json
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    return packageJson.version || "unknown";
  } catch (error) {
    // Fallback version if we can't read the file for some reason
    console.error("Error reading package version:", error);
    return "unknown";
  }
}
