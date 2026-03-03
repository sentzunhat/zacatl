#!/usr/bin/env node
/**
 * generate-barrels.ts
 *
 * Deterministically regenerates `index.ts` barrel files for every directory
 * under `src/` that is opted-in with a `// @barrel-generated` header.
 *
 * ## Barrel ownership
 *
 * | Header                  | Behaviour                                  |
 * |-------------------------|--------------------------------------------|
 * | `// @barrel-generated`  | Owned by this script — always overwritten  |
 * | `// @barrel-manual`     | Not touched — maintained by hand           |
 * | (no header)             | Skipped silently (treated as manual)       |
 *
 * ## Exclusions
 *
 * Add entries to `EXCLUSIONS` to prevent specific files or sub-directories
 * from being re-exported at that level.  This keeps optional heavy
 * peer-dependencies (Sequelize, Mongoose, …) from loading as a side-effect.
 *
 * ## Usage
 *
 *   npm run barrels:generate   # update all opted-in barrels
 *   npm run barrels:verify     # same, then fail on `git diff --exit-code`
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../../src');

/**
 * Exact first line emitted by `buildContent()`.
 * Must stay in sync so idempotency holds on every run.
 */
const GENERATED_HEADER = '// @barrel-generated — do not edit manually';

/**
 * Per-directory exclusion lists.
 *
 * Key   : directory path relative to `src/` (POSIX separators).
 * Value : stems (no `.ts`) or sub-directory names to skip.
 */
const EXCLUSIONS: Readonly<Record<string, ReadonlySet<string>>> = {
  // ORM-specific repositories are intentionally not re-exported at the
  // repositories/ level so consumers that don't use Mongoose/Sequelize never
  // load those modules as a side-effect.
  'service/layers/infrastructure/repositories': new Set(['mongoose', 'sequelize']),
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DirEntries {
  /** Alphabetically sorted stems (no `.ts`) of direct `.ts` siblings. */
  files: string[];
  /** Alphabetically sorted sub-directory names that own an `index.ts`. */
  subdirs: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Collects direct `.ts` files and sub-directories (with an `index.ts`)
 * inside `dirPath`, respecting any exclusions declared for `relDir`.
 *
 * @param dirPath - Absolute path to the directory.
 * @param relDir  - Path relative to `src/` (POSIX separators).
 * @returns Sorted files and subdirs ready for barrel generation.
 */
const collectEntries = (dirPath: string, relDir: string): DirEntries => {
  const exclusions: ReadonlySet<string> = EXCLUSIONS[relDir] ?? new Set<string>();
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const files: string[] = [];
  const subdirs: string[] = [];

  for (const entry of entries) {
    // ── .ts files ──────────────────────────────────────────────────────────
    if (entry.isFile()) {
      if (!entry.name.endsWith('.ts') || entry.name === 'index.ts') continue;
      const stem = entry.name.slice(0, -3);
      if (!exclusions.has(stem)) files.push(stem);
      continue;
    }

    // ── sub-directories ────────────────────────────────────────────────────
    if (entry.isDirectory()) {
      if (exclusions.has(entry.name)) continue;
      const subIndex = path.join(dirPath, entry.name, 'index.ts');
      if (fs.existsSync(subIndex)) subdirs.push(entry.name);
    }
  }

  files.sort();
  subdirs.sort();

  return { files, subdirs };
};

const generateContent = (files: string[], subdirs: string[]): string => {
  const lines: string[] = [GENERATED_HEADER, ''];

  for (const name of files) {
    lines.push(`export * from './${name}';`);
  }

  // Blank separator between the two groups only when both are non-empty
  if (files.length > 0 && subdirs.length > 0) lines.push('');

  for (const name of subdirs) {
    lines.push(`export * from './${name}';`);
  }

  lines.push(''); // trailing newline
  return lines.join('\n');
};

// ---------------------------------------------------------------------------
// Core processor
// ---------------------------------------------------------------------------

const isGeneratorOwned = (indexPath: string): boolean => {
  if (!fs.existsSync(indexPath)) return false;
  const firstLine = fs.readFileSync(indexPath, 'utf-8').split('\n')[0]?.trim() ?? '';
  return firstLine === GENERATED_HEADER;
};

/**
 * Process one directory; returns `1` when the barrel was written, `0` when
 * it was skipped or was already up-to-date.
 */
const processDirectory = (dirPath: string, relDir: string): number => {
  const indexPath = path.join(dirPath, 'index.ts');

  if (!isGeneratorOwned(indexPath)) return 0; // manual or no barrel — skip

  const { files, subdirs } = collectEntries(dirPath, relDir);
  const desired = generateContent(files, subdirs);
  const current = fs.readFileSync(indexPath, 'utf-8');

  if (current === desired) return 0; // already up-to-date — idempotent

  fs.writeFileSync(indexPath, desired, 'utf-8');
  console.log(`  updated  src/${relDir}/index.ts`);
  return 1;
};

/** Recursively walk `src/` and process every opted-in barrel. */
const walkDirectory = (dirPath: string, relDir: string): number => {
  let updated = processDirectory(dirPath, relDir);

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const subRel = relDir ? `${relDir}/${entry.name}` : entry.name;
      updated += walkDirectory(path.join(dirPath, entry.name), subRel);
    }
  }

  return updated;
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const main = (): void => {
  const total = walkDirectory(SRC_DIR, '');

  if (total === 0) {
    console.log('barrels:generate — all barrel files are up to date ✓');
  } else {
    console.log(`\nbarrels:generate — ${total} barrel file(s) updated`);
  }
};

main();
