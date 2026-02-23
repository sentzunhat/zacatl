#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function removeDir(target: string) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log('removed:', target);
  } catch {
    // ignore
  }
}

function walk(dir: string, cb: (filePath: string, stat: fs.Stats) => void) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const stat = fs.statSync(full);
    cb(full, stat);
    if (stat.isDirectory()) walk(full, cb);
  }
}

const root = path.resolve(process.cwd(), 'examples');
if (!fs.existsSync(root)) process.exit(0);

// Remove node_modules and dist directories
walk(root, (p, stat) => {
  if (!stat.isDirectory()) return;
  const name = path.basename(p);
  if (name === 'node_modules' || name === 'dist') removeDir(p);
});

// Remove generated .d.ts when source exists
walk(root, (p, stat) => {
  if (!stat.isFile()) return;
  if (!p.endsWith('.d.ts')) return;
  if (p.includes(`${path.sep}node_modules${path.sep}`)) return;
  const base = p.slice(0, -'.d.ts'.length);
  if (
    fs.existsSync(base + '.ts') ||
    fs.existsSync(base + '.tsx') ||
    fs.existsSync(base + '.svelte')
  ) {
    try {
      fs.unlinkSync(p);
      console.log('removed:', p);
    } catch {}
  }
});

// Remove generated .js and map files when corresponding sources exist; preserve mongo-init.js
walk(root, (p, stat) => {
  if (!stat.isFile()) return;
  if (p.includes(`${path.sep}node_modules${path.sep}`)) return;
  const name = path.basename(p);
  if (name === 'mongo-init.js') return;
  if (p.endsWith('.js') || p.endsWith('.js.map') || p.endsWith('.map')) {
    const base = p.replace(/(\.js(\.map)?|\.map)$/, '');
    if (
      fs.existsSync(base + '.ts') ||
      fs.existsSync(base + '.tsx') ||
      fs.existsSync(base + '.svelte')
    ) {
      try {
        fs.unlinkSync(p);
        console.log('removed:', p);
      } catch {}
    }
  }
});

// Aggressive cleanup: compiled artifacts in apps/*/src and apps/*/frontend/dist
walk(root, (p, stat) => {
  if (!stat.isFile()) return;
  if (p.includes(`${path.sep}node_modules${path.sep}`)) return;
  if (
    p.match(new RegExp(`${path.sep}apps${path.sep}.*${path.sep}src${path.sep}`)) ||
    p.match(new RegExp(`${path.sep}apps${path.sep}.*${path.sep}frontend${path.sep}dist${path.sep}`))
  ) {
    if (
      p.endsWith('.js') ||
      p.endsWith('.js.map') ||
      p.endsWith('.map') ||
      p.endsWith('.d.ts.map')
    ) {
      try {
        fs.unlinkSync(p);
        console.log('removed:', p);
      } catch {}
    }
  }
});

process.exit(0);
