import fs from 'fs';
import path from 'path';

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const publishDir = path.join(root, 'publish');
const publishPkgPath = path.join(publishDir, 'package.json');

const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw) as any;

function ensureDot(p: unknown) {
  if (typeof p !== 'string') return p;
  if (p.startsWith('./') || p.startsWith('/')) return p;
  if (p.startsWith('esm/') || p.startsWith('cjs/')) return `./${p}`;
  if (p.startsWith('build/')) return `./${p}`;
  return p;
}

function fixEntryKeepBuild(entry: any): any {
  if (typeof entry === 'string') {
    const p = ensureDot(entry) as string;
    return p.replace(/^(\.\/)?build\//, './build/esm/');
  }
  if (Array.isArray(entry)) return entry.map(fixEntryKeepBuild);
  if (entry && typeof entry === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(entry)) out[k] = fixEntryKeepBuild(v);
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

// Do not copy script folders into the publish root. Published CLIs should
// point at compiled scripts inside `build-esm/`.

const newPkg: any = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  license: pkg.license,
  keywords: pkg.keywords,
  repository: pkg.repository,
  bugs: pkg.bugs,
  author: pkg.author,
  engines: pkg.engines,
  peerDependencies: pkg.peerDependencies,
  dependencies: pkg.dependencies,
  main: pkg.main
    ? (ensureDot(pkg.main) as string).replace(/^(\.\/)?(build-cjs|cjs|build|esm)\//, './build/cjs/')
    : undefined,
  module: pkg.module
    ? (ensureDot(pkg.module) as string).replace(/^(\.\/)?(build|esm)\//, './build/esm/')
    : undefined,
  types: pkg.types
    ? (ensureDot(pkg.types) as string).replace(/^(\.\/)?(build|esm)\//, './build/esm/')
    : undefined,
  exports: undefined,
};

// Preserve bin mappings but point them to compiled CJS scripts inside publish
if (pkg.bin) {
  const makeLocalBin = (b: string) => {
    if (!b || typeof b !== 'string') return b;
    const p = ensureDot(b) as string;
    // Map any script path to ./build/bin/<file>.js
    const base = path.basename(p).replace(/\.ts$|\.js$/i, '');
    return `./build/bin/${base}.js`;
  };
  if (typeof pkg.bin === 'string') newPkg.bin = makeLocalBin(pkg.bin);
  else if (typeof pkg.bin === 'object') {
    const nb: any = {};
    for (const [k, v] of Object.entries(pkg.bin)) nb[k] = makeLocalBin(v as any);
    newPkg.bin = nb;
  }
}

if (pkg.exports) {
  const fixed: any = {};
  for (const [k, v] of Object.entries(pkg.exports)) fixed[k] = fixEntryKeepBuild(v as any);
  newPkg.exports = fixed;
}
// If the root package did not include `exports`, dynamically generate exports
// by scanning the compiled build folders for JS/MJS files and matching types.
if (!newPkg.exports) {
  const buildEsm = buildEsmDest;
  const exportsObj: any = {};

  if (fs.existsSync(buildEsm)) {
    function addExportFromFile(fullPath: string) {
      const rel = path.relative(buildEsm, fullPath).split(path.sep).join('/');
      const ext = path.extname(rel);
      if (ext !== '.js' && ext !== '.mjs') return;

      // derive subpath: index files map to their directory, others map to file path without ext
      const parts = rel.split('/');
      const last = parts[parts.length - 1] ?? '';
      const isIndex = last.startsWith('index.');
      const sub = isIndex
        ? parts.length === 1
          ? '.'
          : `./${parts.slice(0, -1).join('/')}`
        : `./${rel.slice(0, -ext.length)}`;

      const importPath = `./build/esm/${rel}`;
      const typesPath = `./build/esm/${rel.slice(0, -ext.length)}.d.ts`;
      const requirePath = `./build/cjs/${rel.replace(/\.mjs$/, '.js')}`;

      const entry: any = {};
      if (fs.existsSync(path.join(publishDir, importPath.replace(/^\.\//, ''))))
        entry.import = importPath;
      else return; // skip if import target doesn't actually exist

      if (fs.existsSync(path.join(publishDir, typesPath.replace(/^\.\//, ''))))
        entry.types = typesPath;

      if (fs.existsSync(path.join(publishDir, requirePath.replace(/^\.\//, ''))))
        entry.require = requirePath;

      // prefer .mjs import-only entries where appropriate
      exportsObj[sub] = entry;
    }

    function walk(dir: string) {
      for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, it.name);
        if (it.isDirectory()) walk(full);
        else if (it.isFile()) addExportFromFile(full);
      }
    }

    walk(buildEsm);

    // Add a convenience mapping for build globs and package.json
    exportsObj['./build/*'] = './build/esm/*';
    exportsObj['./package.json'] = './package.json';

    newPkg.exports = exportsObj;
  }
}
const copyIfExists = (name: string) => {
  const src = path.join(root, name);
  const dest = path.join(publishDir, name);
  if (fs.existsSync(src)) fs.copyFileSync(src, dest);
};
copyIfExists('README.md');
copyIfExists('LICENSE');

fs.writeFileSync(publishPkgPath, JSON.stringify(newPkg, null, 2) + '\n');
console.log('Wrote', publishPkgPath);
