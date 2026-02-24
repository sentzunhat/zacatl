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
import { confirm, removeDir } from './common';

function getIgnoredFiles(): string[] {
  // Try to use git to enumerate ignored files. Use a larger buffer to avoid
  // ENOBUFS in some environments. If git fails, fall back to parsing
  // .gitignore and scanning the working tree.
  try {
    const git = spawnSync(
      'git',
      ['ls-files', '--others', '-i', '--exclude-from=.gitignore', '-z'],
      {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      } as any,
    );

    if (!git.error && git.status === 0) {
      const out = git.stdout || '';
      return out
        .split('\0')
        .filter(Boolean)
        .filter((p) => !p.startsWith('!'));
    }

    if (git.error) console.warn(String(git.error));
    if (git.stderr) console.warn(String(git.stderr));
  } catch (err: any) {
    console.warn('git enumeration failed:', err?.message || err);
  }

  // Fallback: parse .gitignore and match files in the repository root.
  const gitignorePath = path.resolve(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) return [];

  const lines = fs
    .readFileSync(gitignorePath, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim());
  const patterns = lines.filter((l) => l && !l.startsWith('#'));
  const negatives = patterns.filter((p) => p.startsWith('!')).map((p) => p.slice(1));
  const positives = patterns.filter((p) => !p.startsWith('!'));

  // Basic glob -> regex conversion supporting '*', '**', and '?'
  function globToRegex(p: string) {
    const pat = p.replace(/\\\\/g, '/');
    let s = pat.replace(/[.+^${}()|[\\]\\]/g, (m) => `\\${m}`);
    s = s.replace(/\\\\\\\\/g, '/');
    s = s.replace(/\*\*/g, '::DOUBLESTAR::');
    s = s.replace(/\*/g, '[^/]*');
    s = s.replace(/::DOUBLESTAR::/g, '.*');
    s = s.replace(/\?/g, '.');
    if (pat.startsWith('/')) return new RegExp('^' + s + '$');
    return new RegExp('(^|/)' + s + '$');
  }

  const posRegex = positives.map(globToRegex);
  const negRegex = negatives.map(globToRegex);

  const matches: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === '.git') continue;
      const full = path.join(dir, e.name);
      const rel = path.relative(process.cwd(), full).replace(/\\\\/g, '/');
      if (e.isDirectory()) {
        walk(full);
      } else {
        for (const rx of posRegex) {
          if (rx.test(rel)) {
            if (negRegex.some((nrx) => nrx.test(rel))) break;
            matches.push(rel);
            break;
          }
        }
      }
    }
  }

  try {
    walk(process.cwd());
  } catch (err: any) {
    console.warn('Fallback .gitignore scan failed:', err?.message || err);
  }

  return matches;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');
const assumeYes = args.includes('--yes') || args.includes('-y');
const allowNodeModules = args.includes('--allow-node-modules') || args.includes('--allow-node');

let files = getIgnoredFiles();
// By default, do not remove anything under node_modules unless explicitly allowed.
if (!allowNodeModules) {
  files = files.filter((f) => !f.startsWith('node_modules/') && f !== 'node_modules');
}
if (files.length === 0) {
  console.log('No ignored untracked files found.');
  process.exit(0);
}

console.log(`${files.length} ignored path(s) found.`);
if (dryRun) {
  files.forEach((f) => console.log(f));
  process.exit(0);
}

async function confirmAndDelete(list: string[]) {
  if (!assumeYes) {
    const ok = await confirm(`Delete ${list.length} path(s)? Type 'yes' to confirm: `);
    if (!ok) {
      console.log('Aborted. No files were removed.');
      process.exit(0);
    }
  }

  for (const rel of list) {
    const p = path.resolve(process.cwd(), rel);
    try {
      if (fs.existsSync(p)) {
        removeDir(p);
        console.log('Removed', rel);
      } else {
        console.log('Not found (skipped)', rel);
      }
    } catch (err: any) {
      console.error('Failed to remove', rel, ':', err?.message || err);
    }
  }
}

confirmAndDelete(files).catch((err) => {
  console.error(err);
  process.exit(1);
});
