#!/usr/bin/env node
/**
 * rm.ts — recursively remove paths relative to the repo root.
 *
 * Modes:
 *   npx tsx scripts/clean/rm.ts <path> [path…]          — remove listed paths/globs
 *   npx tsx scripts/clean/rm.ts --gitignored             — remove git-ignored files
 *                                                          across the repository
 *
 * Glob patterns are supported via Node 22+ built-in glob:
 *   npx tsx scripts/clean/rm.ts 'src/**\/*.js'
 */
import { spawnSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { glob } from 'fs/promises';
import { resolve, relative } from 'path';

const root = process.cwd();
const RM_MAX_RETRIES = 10;
const RM_RETRY_DELAY_MS = 100;
const GIT_CLEAN_MAX_PASSES = 10;

const safeRm = (abs: string): boolean => {
  const rel = relative(root, abs);
  if (rel.startsWith('..') || !rel) {
    // eslint-disable-next-line no-console
    console.warn('skipping path outside repo root:', abs);
    return false;
  }
  if (!existsSync(abs)) return false;

  // Retry transient filesystem races that can surface on macOS when removing
  // large directories like node_modules.
  rmSync(abs, {
    recursive: true,
    force: true,
    maxRetries: RM_MAX_RETRIES,
    retryDelay: RM_RETRY_DELAY_MS,
  });
  // eslint-disable-next-line no-console
  console.log('removed', rel);
  return true;
};

const listGitignored = (): string[] | null => {
  const result = spawnSync(
    'git',
    [
      'ls-files',
      '--others',
      '--ignored',
      '--exclude-standard',
      '--directory',
      '--no-empty-directory',
      '-z',
    ],
    {
      encoding: 'utf8',
      maxBuffer: 100 * 1024 * 1024,
      cwd: root,
      stdio: 'pipe',
      timeout: 5000,
    },
  );

  if (result.error) {
    // eslint-disable-next-line no-console
    console.warn(`git ls-files warning (skipping gitignored cleanup): ${result.error.message}`);
    return null;
  }

  if (result.status !== 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `git ls-files warning (skipping gitignored cleanup): exited with code ${result.status}${
        result.stderr ? ': ' + result.stderr : ''
      }`,
    );
    return null;
  }

  return (result.stdout ?? '').split('\0').filter(Boolean);
};

const cleanGitignored = (): void => {
  let pass = 0;
  let removed = 0;

  while (pass < GIT_CLEAN_MAX_PASSES) {
    pass += 1;

    const entries = listGitignored();
    if (entries === null) return;

    if (entries.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        removed === 0
          ? 'nothing to clean from gitignored'
          : `gitignored cleanup complete (${removed} removed)`,
      );
      return;
    }

    for (const entry of entries) {
      if (safeRm(resolve(root, entry))) {
        removed += 1;
      }
    }
  }

  // eslint-disable-next-line no-console
  console.warn(
    `gitignored cleanup reached max passes (${GIT_CLEAN_MAX_PASSES}); rerun if ignored files remain`,
  );
};

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);

  if (args[0] === '--gitignored') {
    cleanGitignored();
    return;
  }

  if (!args.length) {
    // eslint-disable-next-line no-console
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
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
