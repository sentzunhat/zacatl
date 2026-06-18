#!/usr/bin/env node
/**
 * prune-barrels.ts
 *
 * Removes nested barrel `index.*` files from a built publish tree while
 * preserving the top-level package entrypoints for `build/esm` and `build/cjs`.
 *
 * Usage:
 *   npx tsx scripts/publish/prune-barrels.ts publish/build/esm publish/build/cjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { measureTime } from '../utils/measure-time.js';

const shouldPrune = (rootDir: string, filePath: string): boolean => {
  const rel = path.relative(rootDir, filePath);
  if (!rel || rel.startsWith('..')) return false;

  const parts = rel.split(path.sep);
  const isNestedBarrel = parts.length > 2;
  return isNestedBarrel && path.basename(filePath).startsWith('index.');
};

const pruneTree = (rootDir: string, currentDir: string = rootDir): number => {
  if (!fs.existsSync(currentDir)) return 0;

  let removed = 0;
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const full = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      removed += pruneTree(rootDir, full);
      continue;
    }

    if (entry.isFile() && shouldPrune(rootDir, full)) {
      fs.rmSync(full, { force: true });
      removed += 1;
      // eslint-disable-next-line no-console
      console.log(`removed ${path.relative(process.cwd(), full)}`);
    }
  }

  return removed;
};

export const pruneNestedBarrelIndexes = (rootDirs: readonly string[]): number =>
  rootDirs.reduce((total, rootDir) => total + pruneTree(rootDir), 0);

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

void main();