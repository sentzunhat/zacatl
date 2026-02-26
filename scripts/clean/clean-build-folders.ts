#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { walk, confirm } from './common';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');
const assumeYes = args.includes('--yes') || args.includes('-y');

const root = process.cwd();
const skipTop = new Set(['node_modules', '.git', 'publish']);

function isTargetDir(name: string) {
  // match 'build', 'dist', or build-* (e.g. build-cjs, build-esm)
  return /^build(?:$|-)|^dist$/.test(name);
}

const found = new Set<string>();
walk(root, (p) => {
  const rel = path.relative(root, p);
  const name = path.basename(p);
  if (isTargetDir(name)) found.add(p);
  // avoid recursing into top-level skip folders
  const top = rel.split(path.sep)[0];
  if (skipTop.has(top)) return;
});

const list = Array.from(found).sort();
if (list.length === 0) {
  console.log('No build/dist folders found.');
  process.exit(0);
}

console.log('Found the following build/dist folders:');
for (const p of list) console.log('  -', p);

if (dryRun) process.exit(0);

(async () => {
  if (!assumeYes) {
    const ok = await confirm(`Delete ${list.length} folder(s)? Type 'yes' to confirm: `);
    if (!ok) {
      console.log('Aborted. No folders removed.');
      process.exit(0);
    }
  }

  for (const p of list) {
    try {
      fs.rmSync(p, { recursive: true, force: true });
      console.log('Removed', p);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to remove', p, ':', msg);
    }
  }

  console.log('Done.');
})();
