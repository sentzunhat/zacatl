#!/usr/bin/env node
/**
 * rm.ts — recursively remove paths relative to the repo root.
 *
 * Modes:
 *   npx tsx scripts/clean/rm.ts <path> [path…]          — remove listed paths/globs
 *   npx tsx scripts/clean/rm.ts --gitignored             — remove git-ignored files
 *                                                          (excludes node_modules)
 *
 * Glob patterns are supported via Node 22+ built-in glob:
 *   npx tsx scripts/clean/rm.ts 'src/**\/*.js'
 */
import { rmSync, existsSync } from 'fs';
import { glob } from 'fs/promises';
import { resolve, relative } from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();

const safeRm = (abs: string): void => {
  const rel = relative(root, abs);
  if (rel.startsWith('..') || !rel) {
    console.warn('skipping path outside repo root:', abs);
    return;
  }
  if (!existsSync(abs)) return;
  rmSync(abs, { recursive: true, force: true });
  console.log('removed', rel);
};

const cleanGitignored = (): void => {
  const result = spawnSync(
    'git',
    ['ls-files', '--others', '-i', '--exclude-from=.gitignore', '-z'],
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, cwd: root },
  );
  if (result.error || result.status !== 0) {
    console.error('git ls-files failed:', result.stderr);
    process.exit(1);
  }
  const files = (result.stdout ?? '')
    .split('\0')
    .filter(Boolean)
    .filter((p) => !p.startsWith('node_modules/') && p !== 'node_modules');

  if (files.length === 0) {
    console.log('nothing to clean');
    return;
  }
  files.map((f) => resolve(root, f)).forEach(safeRm);
};

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);

  if (args[0] === '--gitignored') {
    cleanGitignored();
    return;
  }

  if (!args.length) {
    console.error('usage: rm.ts <path|glob> [...] | --gitignored');
    process.exit(1);
  }

  const targets: string[] = [];
  for (const arg of args) {
    if (arg.includes('*') || arg.includes('?')) {
      for await (const match of glob(arg, { cwd: root })) {
        targets.push(resolve(root, match));
      }
    } else {
      targets.push(resolve(root, arg));
    }
  }

  targets.forEach(safeRm);
};

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
