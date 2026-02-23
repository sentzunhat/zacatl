#!/usr/bin/env node
/*
 Safe cleanup: list and optionally delete git-ignored, untracked files
 Usage:
   npx tsx scripts/clean-gitignored.ts --dry-run
   npx tsx scripts/clean-gitignored.ts
   npx tsx scripts/clean-gitignored.ts --yes
*/

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

function getIgnoredFiles(): string[] {
  const git = spawnSync('git', ['ls-files', '--others', '-i', '--exclude-from=.gitignore', '-z'], {
    encoding: 'utf8',
  });
    if (git.error || git.status !== 0) {
      console.warn('Warning: git unavailable or not a git repository; skipping clean-gitignored step.');
      if (git.stderr) console.warn(String(git.stderr));
      if (git.error) console.warn(String(git.error));
      return [];
  }
  const out = git.stdout || '';
  return out.split('\0').filter(Boolean);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');
const assumeYes = args.includes('--yes') || args.includes('-y');

const files = getIgnoredFiles();
if (files.length === 0) {
  console.log('No ignored untracked files found.');
  process.exit(0);
}

console.log(`${files.length} ignored path(s) found.`);
if (dryRun) {
  files.forEach((f) => console.log(f));
  process.exit(0);
}

function confirmAndDelete(list: string[]) {
  if (!assumeYes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`Delete ${list.length} path(s)? Type 'yes' to confirm: `, (answer) => {
      rl.close();
      if (answer !== 'yes') {
        console.log('Aborted. No files were removed.');
        process.exit(0);
      }
      doDelete(list);
    });
  } else {
    doDelete(list);
  }
}

function doDelete(list: string[]) {
  for (const rel of list) {
    const p = path.resolve(process.cwd(), rel);
    try {
      if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
        console.log('Removed', rel);
      } else {
        console.log('Not found (skipped)', rel);
      }
    } catch (err: any) {
      console.error('Failed to remove', rel, ':', err?.message || err);
    }
  }
}

confirmAndDelete(files);
