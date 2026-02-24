import fs from 'fs';
import path from 'path';

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const publishDir = path.join(root, 'publish');
const publishPkgPath = path.join(publishDir, 'package.json');

const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw) as Record<string, unknown>;

function ensureDot(p: unknown) {
  if (typeof p !== 'string') return p;
  if (p.startsWith('./') || p.startsWith('/')) return p;
  if (p.startsWith('esm/') || p.startsWith('cjs/')) return `./${p}`;
  if (p.startsWith('build/')) return `./${p}`;
  return p;
}

function fixEntryKeepBuild(entry: unknown): unknown {
  if (typeof entry === 'string') {
    const p = ensureDot(entry) as string;
    return p.replace(/^(\.\/)?build\//, './build/esm/');
  }
  if (Array.isArray(entry)) return entry.map(fixEntryKeepBuild);
  if (entry && typeof entry === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(entry as Record<string, unknown>))
      out[k] = fixEntryKeepBuild(v);
    return out;
  }
  return entry;
}

try {
  fs.rmSync(publishDir, { recursive: true, force: true });
} catch (_) {}
fs.mkdirSync(publishDir, { recursive: true });

// Copy compiled source into publish/build/{esm,cjs} and include a bin folder
const buildDest = path.join(publishDir, 'build');
const buildEsmDest = path.join(buildDest, 'esm');
const buildCjsDest = path.join(buildDest, 'cjs');
try {
  fs.mkdirSync(buildEsmDest, { recursive: true });
  fs.mkdirSync(buildCjsDest, { recursive: true });
} catch (_) {}

// Prefer build output folders produced by TypeScript build scripts. Projects
// in this repo may emit to `build-src-esm`/`build-src-cjs`, `esm`/`cjs`, or
// `build/esm`/`build/cjs`. Check common candidates and copy the first one
// that exists for each format.
const esmCandidates = [
  path.join(root, 'build-src-esm'),
  path.join(root, 'build', 'esm'),
  path.join(root, 'esm'),
];
const cjsCandidates = [
  path.join(root, 'build-src-cjs'),
  path.join(root, 'build', 'cjs'),
  path.join(root, 'cjs'),
];

function copyFirstExisting(candidates: string[], dest: string) {
  for (const cand of candidates) {
    if (fs.existsSync(cand)) {
      fs.cpSync(cand, dest, { recursive: true });
      return cand;
    }
  }
  return null;
}

const usedEsm = copyFirstExisting(esmCandidates, buildEsmDest);
const usedCjs = copyFirstExisting(cjsCandidates, buildCjsDest);
if (!usedEsm) console.warn('No ESM build source found in', esmCandidates);
if (!usedCjs) console.warn('No CJS build source found in', cjsCandidates);

// Copy selected built scripts (CLI helpers) into publish/build/bin so published
// package provides stable CLI entrypoints without copying the whole scripts
// source folder. Prefer cjs versions for bin compatibility.
const binDir = path.join(buildDest, 'bin');
try {
  fs.mkdirSync(binDir, { recursive: true });
} catch (_) {}

const scriptsCandidates = [
  path.join(root, 'build-scripts-cjs', 'fix-esm.js'),
  path.join(root, 'build-scripts-esm', 'fix-esm.js'),
];
// Copy any prepared `build/bin` first (preferred). Otherwise, copy useful
// helper scripts from build-scripts-* folders.
const buildBinCandidates = [
  path.join(root, 'build', 'bin'),
  path.join(root, 'build-src-cjs', 'bin'),
  path.join(root, 'build-src-esm', 'bin'),
  path.join(root, 'bin'),
];

let copiedBin = false;
for (const b of buildBinCandidates) {
  if (fs.existsSync(b)) {
    try {
      fs.cpSync(b, binDir, { recursive: true });
      copiedBin = true;
    } catch (_) {}
    break;
  }
}

if (!copiedBin) {
  for (const cand of scriptsCandidates) {
    if (fs.existsSync(cand)) {
      const dest = path.join(binDir, path.basename(cand));
      try {
        fs.copyFileSync(cand, dest);
        try {
          fs.chmodSync(dest, 0o755);
        } catch (_) {}
      } catch (_) {}
    }
  }
}

// Remove source map files from the publish bundle to avoid publishing
// generated maps (optional: keeps package smaller and avoids exposing
// source through uploaded maps). If you prefer to keep maps for
// debugging, remove this block.
function removeSourceMaps(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) removeSourceMaps(full);
    else if (it.isFile() && full.endsWith('.map')) {
      try {
        fs.rmSync(full);
      } catch (_) {}
    }
  }
}

removeSourceMaps(buildEsmDest);
removeSourceMaps(buildCjsDest);

// Ensure ESLint config and localization locales exist in the CJS build so
// package exports can include `require` targets for consumers that use CJS.
try {
  const esmEslint = path.join(buildEsmDest, 'eslint');
  const esmLocalization = path.join(buildEsmDest, 'localization');
  if (fs.existsSync(esmEslint) && !fs.existsSync(path.join(buildCjsDest, 'eslint'))) {
    try {
      fs.cpSync(esmEslint, path.join(buildCjsDest, 'eslint'), { recursive: true });
    } catch (_) {}
  }
  if (fs.existsSync(esmLocalization) && !fs.existsSync(path.join(buildCjsDest, 'localization'))) {
    try {
      fs.cpSync(esmLocalization, path.join(buildCjsDest, 'localization'), { recursive: true });
    } catch (_) {}
  }
} catch (_) {}

// Do not copy script folders into the publish root. Published CLIs should
// point at compiled scripts inside `build-esm/`.

interface PublishPkg {
  name?: string;
  version?: string;
  description?: string;
  license?: string;
  keywords?: string[] | unknown;
  repository?: unknown;
  bugs?: unknown;
  author?: unknown;
  engines?: unknown;
  peerDependencies?: Record<string, string> | unknown;
  dependencies?: Record<string, string> | unknown;
  main?: string | undefined;
  module?: string | undefined;
  types?: string | undefined;
  exports?: Record<string, unknown> | undefined;
  bin?: Record<string, string> | string | undefined;
  files?: string[] | undefined;
}

const newPkg: PublishPkg = {
  name: typeof pkg['name'] === 'string' ? (pkg['name'] as string) : undefined,
  version: typeof pkg['version'] === 'string' ? (pkg['version'] as string) : undefined,
  description: typeof pkg['description'] === 'string' ? (pkg['description'] as string) : undefined,
  license: typeof pkg['license'] === 'string' ? (pkg['license'] as string) : undefined,
  keywords: Array.isArray(pkg['keywords']) ? (pkg['keywords'] as string[]) : undefined,
  repository: pkg['repository'],
  bugs: pkg['bugs'],
  author: pkg['author'],
  engines: pkg['engines'],
  peerDependencies: pkg['peerDependencies'],
  dependencies: pkg['dependencies'],
  main: pkg['main']
    ? (ensureDot(pkg['main']) as string).replace(
        /^(\.\/)?(build-cjs|cjs|build|esm)\//,
        './build/cjs/',
      )
    : undefined,
  module: pkg['module']
    ? (ensureDot(pkg['module']) as string).replace(/^(\.\/)?(build|esm)\//, './build/esm/')
    : undefined,
  types: pkg['types']
    ? (ensureDot(pkg['types']) as string).replace(/^(\.\/)?(build|esm)\//, './build/esm/')
    : undefined,
  exports: undefined,
};

// Preserve bin mappings but point them to compiled CJS scripts inside publish
if (pkg['bin']) {
  const makeLocalBin = (b: string) => {
    if (!b || typeof b !== 'string') return b;
    const p = ensureDot(b) as string;
    // Map any script path to ./build/bin/<file>.js
    const base = path.basename(p).replace(/\.ts$|\.js$/i, '');
    return `./build/bin/${base}.js`;
  };
  if (typeof pkg['bin'] === 'string') newPkg['bin'] = makeLocalBin(pkg['bin']);
  else if (typeof pkg['bin'] === 'object') {
    const nb: Record<string, string> = {};
    for (const [k, v] of Object.entries(pkg['bin'] as Record<string, unknown>)) {
      const mv = makeLocalBin(typeof v === 'string' ? v : String(v));
      if (typeof mv === 'string') nb[k] = mv;
    }
    newPkg['bin'] = nb;
  }
}

if (pkg['exports']) {
  const fixed: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(pkg['exports'] as Record<string, unknown>))
    fixed[k] = fixEntryKeepBuild(v);
  newPkg['exports'] = fixed;
}
// If the root package did not include `exports`, dynamically generate exports
// by scanning the compiled build folders for JS/MJS files and matching types.
if (!newPkg['exports']) {
  // Generate a controlled, per-file exports map by scanning the compiled
  // ESM build directory. This approach exports only files that actually
  // exist in the published build and creates precise subpaths for deep
  // imports (e.g. @sentzunhat/zacatl/foo/bar).
  const buildEsm = buildEsmDest;
  const exportsObj: Record<string, unknown> = {};

  if (fs.existsSync(buildEsm)) {
    function addExport(fullPath: string) {
      const rel = path.relative(buildEsm, fullPath).split(path.sep).join('/');
      const ext = path.extname(rel);
      if (ext !== '.js' && ext !== '.mjs') return;

      const parts = rel.split('/');
      const last = parts[parts.length - 1] ?? '';
      const isIndex = last.startsWith('index.');

      // Subpath exposed to consumers
      const sub = isIndex
        ? parts.length === 1
          ? '.'
          : `./${parts.slice(0, -1).join('/')}`
        : `./${rel.slice(0, -ext.length)}`;

      const importPath = `./build/esm/${rel}`;
      const typesPath = `./build/esm/${rel.slice(0, -ext.length)}.d.ts`;
      const requirePath = `./build/cjs/${rel.replace(/\.mjs$/, '.js')}`;

      const entry: Record<string, string> = {};
      if (fs.existsSync(path.join(publishDir, importPath.replace(/^\.\//, ''))))
        entry['import'] = importPath;
      else return; // skip if import target doesn't exist

      if (fs.existsSync(path.join(publishDir, typesPath.replace(/^\.\//, ''))))
        entry['types'] = typesPath;
      if (fs.existsSync(path.join(publishDir, requirePath.replace(/^\.\//, ''))))
        entry['require'] = requirePath;

      exportsObj[sub] = entry;
    }

    function walk(dir: string) {
      for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, it.name);
        if (it.isDirectory()) walk(full);
        else if (it.isFile()) addExport(full);
      }
    }

    walk(buildEsm);

    // Always expose package.json
    exportsObj['./package.json'] = './package.json';

    newPkg['exports'] = exportsObj;
  }
}
const copyIfExists = (name: string) => {
  const src = path.join(root, name);
  const dest = path.join(publishDir, name);
  if (fs.existsSync(src)) fs.copyFileSync(src, dest);
};
copyIfExists('README.md');
copyIfExists('LICENSE');

// Ensure the `zacatl-fix-esm` CLI entry exists in the published package.
// Ensure the `zacatl-fix-esm` CLI entry exists in the published package.
// Preserve original `pkg.bin` but force the known CLI entry for consumers
// that depend on the helper script being available in published packages.
if (!newPkg.bin || typeof newPkg.bin === 'string') newPkg.bin = {};
if (!(newPkg.bin as Record<string, string>)['zacatl-fix-esm']) {
  (newPkg.bin as Record<string, string>)['zacatl-fix-esm'] = './build/bin/fix-esm.js';
}

// Limit published files to the compiled build and the package manifest.
if (!newPkg['files']) newPkg['files'] = ['build', 'package.json'];

fs.writeFileSync(publishPkgPath, JSON.stringify(newPkg, null, 2) + '\n');
console.log('Wrote', publishPkgPath);
