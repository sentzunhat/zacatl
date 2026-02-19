#!/usr/bin/env node

/**
 * Unified ESM Fix - Adds .js extensions to imports for Node.js ESM compatibility
 *
 * Usage:
 *   node fix-esm.mjs [directory] [options]
 *   node fix-esm.mjs              # Default: ./build
 *   node fix-esm.mjs dist         # Fix ./dist directory
 *   node fix-esm.mjs ./build      # Fix ./build directory
 *
 * Exit codes:
 *   0 - Success
 *   1 - Error
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Determine target directory
let targetDir = process.argv[2] || "build";
let distDir;

// If argument is absolute path, use it; otherwise resolve relative to cwd
if (path.isAbsolute(targetDir)) {
  distDir = targetDir;
} else {
  // First try relative to current working directory
  distDir = path.resolve(process.cwd(), targetDir);

  // For framework build, also try relative to root if not found
  if (!fs.existsSync(distDir) && targetDir === "build") {
    const rootBuild = path.join(rootDir, "build");
    if (fs.existsSync(rootBuild)) {
      distDir = rootBuild;
    }
  }
}

if (!fs.existsSync(distDir)) {
  console.error(`✗ Directory not found: ${distDir}`);
  process.exit(1);
}

/**
 * Recursively find all .js files in directory
 */
function walkDir(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.name.startsWith(".")) continue;

    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (item.isFile() && item.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Fix ESM imports in a file by adding .js extensions
 */
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;
  const fileDir = path.dirname(filePath);

  // Match both export and import statements with relative paths without .js
  const patterns = [
    // Export statements: export * from "./path" or export { x } from "./path"
    /export\s+(?:\*|\{[^}]+\})\s+from\s+["'](\.[^"']*?)(?<!\.js)["']/g,
    // Import statements: import ... from "./path"
    /import\s+(?:(?:\{[^}]+\}|[\w]+)(?:\s*,\s*(?:\{[^}]+\}|[\w]+))*\s+from\s+)?["'](\.[^"']*?)(?<!\.js)["']/g,
    // Dynamic imports: import("./path")
    /import\(["'](\.[^"']*?)(?<!\.js)["']\)/g,
  ];

  patterns.forEach((pattern) => {
    content = content.replace(pattern, (match, importPath) => {
      // Skip .json files
      if (importPath.endsWith(".json")) return match;

      // Resolve the import path relative to the current file
      const resolvedPath = path.resolve(fileDir, importPath);

      // Check if it's a directory
      if (
        fs.existsSync(resolvedPath) &&
        fs.statSync(resolvedPath).isDirectory()
      ) {
        // Directory: add /index.js
        return match
          .replace(`"${importPath}"`, `"${importPath}/index.js"`)
          .replace(`'${importPath}'`, `'${importPath}/index.js'`);
      } else {
        // File or doesn't exist yet: add .js
        return match
          .replace(`"${importPath}"`, `"${importPath}.js"`)
          .replace(`'${importPath}'`, `'${importPath}.js'`);
      }
    });
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  }

  return false;
}

try {
  const files = walkDir(distDir);
  let fixed = 0;

  for (const file of files) {
    if (fixFile(file)) {
      fixed++;
    }
  }

  console.log(`✓ Fixed ESM exports: ${fixed} file(s) updated`);
  process.exit(0);
} catch (error) {
  console.error(`✗ Error fixing ESM exports: ${error.message}`);
  process.exit(1);
}
