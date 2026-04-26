#!/usr/bin/env node
/**
 * prune-barrels.ts
 *
 * Removes nested barrel `index.*` files from a built publish tree while
 * preserving package entrypoints that are still intentionally exported.
 *
 * Usage:
 *   npx tsx scripts/publish/prune-barrels.ts publish/build/esm publish/build/cjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { measureTime } from '../utils/measure-time.js';

const normalizePath = (value: string): string => value.replace(/\\/g, '/').replace(/^\.\//, '');

const collectExportTargets = (value: unknown, targets: Set<string>): void => {
  if (typeof value === 'string') {
    targets.add(normalizePath(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectExportTargets(item, targets);
    return;
  }

  if (value !== null && typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectExportTargets(item, targets);
    }
  }
};

export const getExportTargets = (packageJsonPath = path.resolve('package.json')): Set<string> => {
  if (!fs.existsSync(packageJsonPath)) return new Set();

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as Record<string, unknown>;
  const targets = new Set<string>();

  collectExportTargets(pkg.main, targets);
  collectExportTargets(pkg.module, targets);
  collectExportTargets(pkg.types, targets);
  collectExportTargets(pkg.exports, targets);

  return targets;
};

const shouldPrune = (rootDir: string, filePath: string, exportTargets: ReadonlySet<string>): boolean => {
  const rel = path.relative(rootDir, filePath);
  if (!rel || rel.startsWith('..')) return false;

  // Resolve file path relative to package root so it matches package.json export strings
  const rootName = path.basename(rootDir);
  const sourceRel = normalizePath(path.join(rootName, rel));

  if (exportTargets.has(sourceRel)) return false;

  const parts = rel.split(path.sep);
  const isNestedBarrel = parts.length > 2 && path.basename(filePath).startsWith('index.');
  return isNestedBarrel;
};

const pruneTree = (
  rootDir: string,
  exportTargets: ReadonlySet<string>,
  currentDir: string = rootDir,
): number => {
  if (!fs.existsSync(currentDir)) return 0;

  let removed = 0;
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const full = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      removed += pruneTree(rootDir, exportTargets, full);
      continue;
    }

    if (entry.isFile() && shouldPrune(rootDir, full, exportTargets)) {
      fs.rmSync(full, { force: true });
      removed += 1;
      // eslint-disable-next-line no-console
      console.log(`removed ${path.relative(process.cwd(), full)}`);
    }
  }

  return removed;
};

export const pruneNestedBarrelIndexes = (
  rootDirs: readonly string[],
  exportTargets: ReadonlySet<string> = getExportTargets(),
): number => rootDirs.reduce((total, rootDir) => total + pruneTree(rootDir, exportTargets), 0);

const main = async (): Promise<void> => {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    // eslint-disable-next-line no-console
    console.error('usage: prune-barrels.ts <build-dir> [build-dir...]');
    process.exit(1);
  }

  await measureTime({
    name: 'prune-barrels',
    fn: async () => {
      const removed = pruneNestedBarrelIndexes(targets.map((target) => path.resolve(target)));
      if (removed === 0) {
        // eslint-disable-next-line no-console
        console.log('No nested barrel files found ✓');
      } else {
        // eslint-disable-next-line no-console
        console.log(`${removed} nested barrel file(s) removed`);
      }
    },
  });
};

const isCli = (() => {
  const entry = process.argv[1];
  if (!entry) return false;

  const basename = path.basename(entry);
  return basename === 'prune-barrels.ts' || basename === 'prune-barrels.js';
})();

if (isCli) {
  void main();
}
