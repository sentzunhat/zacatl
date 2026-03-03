/**
 * sync-local-exports.ts
 *
 * After `npm run build`, reads `build-src-esm/` and writes a matching
 * `exports` map into the root `package.json`.
 *
 * This lets the symlinked local package resolve every subpath import
 * (e.g. `@sentzunhat/zacatl/third-party/fastify`) without manual `paths`
 * hacks in consuming tsconfigs.
 *
 * Each entry has three conditions mirroring what prepare-publish.ts emits
 * for the published package:
 *   - types   → build-src-esm/<module>.d.ts
 *   - import  → build-src-esm/<module>.js   (ESM)
 *   - require → build-src-cjs/<module>.js   (CJS, when present)
 *
 * prepare-publish.ts rewrites build-src-esm/ → build/esm/ and
 * build-src-cjs/ → build/cjs/ when assembling the publish tarball.
 *
 * Usage (called automatically via postbuild):
 *   npx tsx scripts/dev/sync-local-exports.ts
 */

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const buildEsmDir = path.join(root, 'build-src-esm');
const buildCjsDir = path.join(root, 'build-src-cjs');
const pkgPath = path.join(root, 'package.json');

if (!fs.existsSync(buildEsmDir)) {
  console.error(`✗ build-src-esm not found — run "npm run build" first`);
  process.exit(1);
}

const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw) as Record<string, unknown>;

const exportsMap: Record<string, unknown> = {};

const addExport = (fullPath: string): void => {
  const rel = path.relative(buildEsmDir, fullPath).split(path.sep).join('/');
  const ext = path.extname(rel);
  if (ext !== '.js' && ext !== '.mjs') return;

  const parts = rel.split('/');
  const last = parts[parts.length - 1] ?? '';
  const isIndex = last.startsWith('index.');

  // Compute the subpath key: index.js → ".", service/index.js → "./service"
  const sub = isIndex
    ? parts.length === 1
      ? '.'
      : `./${parts.slice(0, -1).join('/')}`
    : `./${rel.slice(0, -ext.length)}`;

  const importPath = `./build-src-esm/${rel}`;
  const typesPath = `./build-src-esm/${rel.slice(0, -ext.length)}.d.ts`;
  const requirePath = `./build-src-cjs/${rel.replace(/\.mjs$/, '.js')}`;

  const entry: Record<string, string> = {};

  if (fs.existsSync(path.join(root, typesPath))) entry['types'] = typesPath;
  entry['import'] = importPath;
  if (fs.existsSync(path.join(buildCjsDir, rel.replace(/\.mjs$/, '.js'))))
    entry['require'] = requirePath;

  exportsMap[sub] = entry;
};

const walk = (dir: string): void => {
  for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) walk(full);
    else if (it.isFile()) addExport(full);
  }
};

walk(buildEsmDir);
exportsMap['./package.json'] = './package.json';

// Sort: "." first, then alphabetically
const sorted: Record<string, unknown> = {};
const keys = Object.keys(exportsMap).sort((a, b) => {
  if (a === '.') return -1;
  if (b === '.') return 1;
  return a.localeCompare(b);
});
for (const k of keys) sorted[k] = exportsMap[k];

pkg['exports'] = sorted;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✓ Synced ${keys.length} export(s) → package.json`);
