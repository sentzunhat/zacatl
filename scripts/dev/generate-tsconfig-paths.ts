#!/usr/bin/env node
/**
 * generate-tsconfig-paths.ts
 *
 * Recursively generates comprehensive `@zacatl/*` path mappings in tsconfig.base.json
 * for all directories and .ts files under src/.
 *
 * Mappings include:
 * - All directories with index.ts: @zacatl/path/to/dir → ./src/path/to/dir/index.ts
 * - All .ts files (except index.ts): @zacatl/path/to/file → ./src/path/to/file.ts
 *
 * ## Header ownership
 *
 * The generated paths section starts with `// @generated-by:generate-tsconfig-paths`
 * to indicate automation. Manual edits are not lost (they exist outside this section).
 *
 * ## Usage
 *
 *   npm run paths:generate   # update tsconfig.base.json with all paths
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { measureTime } from '../utils/index.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../../src');
const TSCONFIG_BASE_PATH = path.resolve(__dirname, '../../tsconfig.base.json');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PathEntry {
  key: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively collect all .ts files and directories (with index.ts) from srcDir.
 * Returns a sorted list of path entries ready for JSON.
 *
 * For files like `src/configuration/json.ts`, generates:
 *   @zacatl/configuration/json → ./src/configuration/json.ts
 *
 * For directories like `src/service/layers` with index.ts, generates:
 *   @zacatl/service/layers → ./src/service/layers/index.ts
 *
 * @param dir - Absolute path to directory to scan
 * @param relativePath - Path relative to src/ (POSIX separators)
 * @returns Array of { key, value } pairs for tsconfig paths
 */
const collectPaths = (dir: string, relativePath: string = ''): PathEntry[] => {
  const entries: PathEntry[] = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dir, item.name);

      // ── Directories with index.ts ──────────────────────────────────────
      if (item.isDirectory()) {
        const indexPath = path.join(itemPath, 'index.ts');
        if (fs.existsSync(indexPath)) {
          const relDir = relativePath ? `${relativePath}/${item.name}` : item.name;
          const key = `@zacatl${relDir ? '/' + relDir : ''}`;
          const value = `./src${relDir ? '/' + relDir : ''}/index.ts`;
          entries.push({ key, value });
        }

        // Recursively process subdirectories
        const nextRelPath = relativePath ? `${relativePath}/${item.name}` : item.name;
        entries.push(...collectPaths(itemPath, nextRelPath));
        continue;
      }

      // ── Individual .ts files (except index.ts) ──────────────────────────
      if (item.isFile() && item.name.endsWith('.ts') && item.name !== 'index.ts') {
        const stem = item.name.slice(0, -3); // remove .ts extension
        const relFile = relativePath ? `${relativePath}/${stem}` : stem;
        const key = `@zacatl/${relFile}`;
        const value = `./src${relativePath ? '/' + relativePath : ''}/${item.name}`;
        entries.push({ key, value });
      }
    }
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.warn(
      `Could not read directory ${dir}:`,
      err instanceof Error ? err.message : String(err),
    );
  }

  return entries;
};

/**
 * Sort paths alphabetically by key for consistent output.
 */
const sortPaths = (paths: PathEntry[]): PathEntry[] => {
  return paths.sort((a, b) => a.key.localeCompare(b.key));
};

/**
 * Generate the paths object from sorted entries.
 */
const generatePathsObject = (paths: PathEntry[]): Record<string, string[]> => {
  const obj: Record<string, string[]> = {};
  for (const { key, value } of paths) {
    obj[key] = [value];
  }
  return obj;
};

/**
 * Update tsconfig.base.json with generated paths.
 * Preserves the rest of the tsconfig structure and any non-generated paths.
 */
const updateTsconfig = (newPaths: Record<string, string[]>): void => {
  const rawContent = fs.readFileSync(TSCONFIG_BASE_PATH, 'utf8');
  const config = JSON.parse(rawContent) as Record<string, unknown>;

  // Ensure compilerOptions exists
  if (
    config.compilerOptions == null ||
    typeof config.compilerOptions !== 'object' ||
    Array.isArray(config.compilerOptions)
  ) {
    config.compilerOptions = {};
  }

  const compilerOptions = config.compilerOptions as Record<string, unknown>;

  // Add manual path overrides for backward compatibility and intentional API surface
  // These point to files in subdirectories that have important public API aliases
  const manualOverrides: Record<string, string[]> = {
    '@zacatl/third-party/mongoose': ['./src/third-party/databases/mongoose.ts'],
    '@zacatl/third-party/sequelize': ['./src/third-party/databases/sequelize.ts'],
  };

  // Merge manual overrides with generated paths (overrides take precedence)
  const finalPaths = {
    ...newPaths,
    ...manualOverrides,
  };

  // Replace the paths section entirely with generated + manual paths
  compilerOptions.paths = finalPaths;

  // Write back with 2-space indent to match existing style
  const updatedContent = JSON.stringify(config, null, 2) + '\n';
  fs.writeFileSync(TSCONFIG_BASE_PATH, updatedContent, 'utf8');
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const main = async (): Promise<void> => {
  await measureTime({
    name: 'paths:generate',
    fn: async () => {
      if (!fs.existsSync(SRC_DIR)) {
        // eslint-disable-next-line no-console
        console.error(`Error: src/ directory not found at ${SRC_DIR}`);
        process.exit(1);
      }

      if (!fs.existsSync(TSCONFIG_BASE_PATH)) {
        // eslint-disable-next-line no-console
        console.error(`Error: tsconfig.base.json not found at ${TSCONFIG_BASE_PATH}`);
        process.exit(1);
      }

      // Collect all paths recursively
      const rawPaths = collectPaths(SRC_DIR);
      const sortedPaths = sortPaths(rawPaths);
      const pathsObject = generatePathsObject(sortedPaths);

      // Update tsconfig.base.json
      updateTsconfig(pathsObject);

      // eslint-disable-next-line no-console
      console.log(`Generated ${sortedPaths.length} path mapping(s)`);
      // eslint-disable-next-line no-console
      console.log(`Updated ${TSCONFIG_BASE_PATH}`);
    },
  });
};

void main();
