#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');
const assumeYes = args.includes('--yes') || args.includes('-y');

const root = process.cwd();
const skipTop = new Set(['node_modules', '.git', 'publish']);

function isTargetDir(name: string) {
  // match 'build', 'dist', or build-* (e.g. build-cjs, build-esm)
  return /^build(?:$|-)|^dist$/.test(name);
}

function walk(dir: string, cb: (p: string) => void) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      cb(full);
      // do not recurse into skipped top-level directories
      const rel = path.relative(root, full).split(path.sep)[0];
      if (skipTop.has(rel)) continue;
      walk(full, cb);
    }
  }
}

const found = new Set<string>();
walk(root, (p) => {
  const name = path.basename(p);
  if (isTargetDir(name)) found.add(p);
});

const list = Array.from(found).sort();
if (list.length === 0) {
  console.log('No build/dist folders found.');
  process.exit(0);
}

console.log('Found the following build/dist folders:');
for (const p of list) console.log('  -', p);

if (dryRun) process.exit(0);

function confirm(prompt: string) {
  return new Promise<boolean>((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans === 'yes' || ans === 'y');
    });
  });
}

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
    } catch (err: any) {
      console.error('Failed to remove', p, ':', err?.message || err);
    }
  }

  console.log('Done.');
})();
