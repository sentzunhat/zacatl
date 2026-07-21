import fs from 'fs';
import path from 'path';

import { pruneNestedBarrelIndexes } from './prune-barrels.js';

const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const publishDir = path.join(root, 'publish');
const publishPkgPath = path.join(publishDir, 'package.json');

const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw) as Record<string, unknown>;

const ensureDot = (p: unknown): unknown => {
  if (typeof p !== 'string') return p;
  if (p.startsWith('./') || p.startsWith('/')) return p;
  if (p.startsWith('esm/') || p.startsWith('cjs/')) return `./${p}`;
  if (p.startsWith('build/')) return `./${p}`;
  return p;
};

const fixEntryKeepBuild = (entry: unknown): unknown => {
  if (typeof entry === 'string') {
    const p = ensureDot(entry) as string;
    return p
      .replace(/^(\.\/)?(build-src-esm)\//, './build/esm/')
      .replace(/^(\.\/)?(build-src-cjs)\//, './build/cjs/')
      .replace(/^(\.\/)?(build)\/(?!esm\/|cjs\/)/, './build/esm/');
  }
  if (Array.isArray(entry)) return entry.map(fixEntryKeepBuild);
  if (entry !== null && typeof entry === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(entry as Record<string, unknown>))
      out[k] = fixEntryKeepBuild(v);
    return out;
  }
  return entry;
};

fs.rmSync(publishDir, { recursive: true, force: true });
fs.mkdirSync(publishDir, { recursive: true });

// Copy compiled source into publish/build/{esm,cjs} and include a bin folder
const buildDest = path.join(publishDir, 'build');
const buildEsmDest = path.join(buildDest, 'esm');
const buildCjsDest = path.join(buildDest, 'cjs');
fs.mkdirSync(buildEsmDest, { recursive: true });
fs.mkdirSync(buildCjsDest, { recursive: true });

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

const copyFirstExisting = (candidates: string[], dest: string): string | null => {
  for (const cand of candidates) {
    if (fs.existsSync(cand)) {
      fs.cpSync(cand, dest, { recursive: true });
      return cand;
    }
  }
  return null;
};

const usedEsm = copyFirstExisting(esmCandidates, buildEsmDest);
const usedCjs = copyFirstExisting(cjsCandidates, buildCjsDest);
// eslint-disable-next-line no-console
if (usedEsm === null) console.warn('No ESM build source found in', esmCandidates);
// eslint-disable-next-line no-console
if (usedCjs === null) console.warn('No CJS build source found in', cjsCandidates);

// The published root package.json declares "type": "module", so the CJS tree
// needs its own scope marker or every `require()` subpath would load .js
// files under build/cjs as ESM and crash for CommonJS consumers.
if (usedCjs !== null) {
  fs.writeFileSync(
    path.join(buildCjsDest, 'package.json'),
    `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
  );
}

pruneNestedBarrelIndexes([buildEsmDest, buildCjsDest]);

const binDir = path.join(buildDest, 'bin');
fs.mkdirSync(binDir, { recursive: true });

const scriptsCandidates = [
  path.join(root, 'build-scripts-esm', 'fix-esm.js'),
  path.join(root, 'build-scripts-cjs', 'fix-esm.js'),
  path.join(root, 'build-scripts-esm', 'build', 'fix-esm.js'),
  path.join(root, 'build-scripts-cjs', 'build', 'fix-esm.js'),
];

const scriptsUtilsCandidates = [
  path.join(root, 'build-scripts-esm', 'utils'),
  path.join(root, 'build-scripts-cjs', 'utils'),
];

// Copy fix-esm.js into bin/ and rewrite its utils import to be self-contained
for (const cand of scriptsCandidates) {
  if (fs.existsSync(cand)) {
    try {
      const dest = path.join(binDir, 'fix-esm.js');
      // Rewrite all ../utils/* imports to ./utils/* so the script is self-contained
      let content = fs.readFileSync(cand, 'utf-8');
      content = content.replace(/from\s+['"]\.\.\/utils\//g, "from './utils/");
      fs.writeFileSync(dest, content, 'utf-8');
      try {
        fs.chmodSync(dest, 0o755);
      } catch (_) {
        /* chmod failures are non-fatal on Windows */
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.warn(
        `Could not copy script ${cand} to fix-esm.js:`,
        err instanceof Error ? err.message : String(err),
      );
    }
    break;
  }
}

// Copy utils into bin/ to make fix-esm.js self-contained
const binUtilsDest = path.join(binDir, 'utils');
let copiedScriptUtils = false;
for (const utilsDir of scriptsUtilsCandidates) {
  if (fs.existsSync(utilsDir)) {
    try {
      fs.cpSync(utilsDir, binUtilsDest, { recursive: true });
      copiedScriptUtils = true;
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.warn(
        `Could not copy script utils from ${utilsDir}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
    break;
  }
}

if (!copiedScriptUtils) {
  // eslint-disable-next-line no-console
  console.warn('No compiled script utils found in', scriptsUtilsCandidates);
}

const removeSourceMaps = (dir: string): void => {
  if (!fs.existsSync(dir)) return;
  for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) removeSourceMaps(full);
    else if (it.isFile() && full.endsWith('.map')) {
      try {
        fs.rmSync(full);
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.warn(
          `Could not remove source map ${full}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }
  }
};

removeSourceMaps(buildEsmDest);
removeSourceMaps(buildCjsDest);

const esmEslint = path.join(buildEsmDest, 'eslint');
const esmLocalization = path.join(buildEsmDest, 'localization');
if (fs.existsSync(esmEslint) && !fs.existsSync(path.join(buildCjsDest, 'eslint'))) {
  try {
    fs.cpSync(esmEslint, path.join(buildCjsDest, 'eslint'), { recursive: true });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.warn(
      'Could not copy eslint assets to CJS build:',
      err instanceof Error ? err.message : String(err),
    );
  }
}
if (fs.existsSync(esmLocalization) && !fs.existsSync(path.join(buildCjsDest, 'localization'))) {
  try {
    fs.cpSync(esmLocalization, path.join(buildCjsDest, 'localization'), { recursive: true });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.warn(
      'Could not copy localization assets to CJS build:',
      err instanceof Error ? err.message : String(err),
    );
  }
}

interface PublishPkg {
  name?: string | undefined;
  version?: string | undefined;
  description?: string | undefined;
  homepage?: string | undefined;
  license?: string | undefined;
  type?: string | undefined;
  keywords?: string[] | unknown;
  repository?: unknown;
  bugs?: unknown;
  author?: unknown;
  engines?: unknown;
  peerDependencies?: Record<string, string> | unknown;
  peerDependenciesMeta?: Record<string, unknown> | unknown;
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
  homepage: typeof pkg['homepage'] === 'string' ? (pkg['homepage'] as string) : undefined,
  license: typeof pkg['license'] === 'string' ? (pkg['license'] as string) : undefined,
  type: 'module',
  keywords: Array.isArray(pkg['keywords']) ? (pkg['keywords'] as string[]) : undefined,
  bugs: pkg['bugs'],
  author: pkg['author'],
  engines: pkg['engines'],
  peerDependencies: pkg['peerDependencies'],
  peerDependenciesMeta: pkg['peerDependenciesMeta'],
  dependencies: pkg['dependencies'],
  repository: (() => {
    const repo = pkg['repository'];
    if (repo !== null && typeof repo === 'object' && 'url' in (repo as object)) {
      const r = repo as Record<string, string>;
      const url = r['url'] ?? '';
      return { ...r, url: url.startsWith('git+') ? url : `git+${url}` };
    }
    return repo;
  })(),
  main:
    typeof pkg['main'] === 'string'
      ? (ensureDot(pkg['main']) as string).replace(
        /^(\.\/)?(build-cjs|cjs|build|esm)\//,
        './build/cjs/',
      )
      : undefined,
  module:
    typeof pkg['module'] === 'string'
      ? (ensureDot(pkg['module']) as string).replace(/^(\.\/)?(build|esm)\//, './build/esm/')
      : undefined,
  types:
    typeof pkg['types'] === 'string'
      ? (ensureDot(pkg['types']) as string).replace(/^(\.\/)?(build|esm)\//, './build/esm/')
      : undefined,
  exports: undefined,
};

if (pkg['bin'] !== undefined) {
  const makeLocalBin = (b: string): string => {
    if (!b) return b;
    const p = ensureDot(b) as string;
    const base = path.basename(p).replace(/\.ts$|\.js$/i, '');
    return `build/bin/${base}.js`;
  };
  if (typeof pkg['bin'] === 'string') newPkg['bin'] = makeLocalBin(pkg['bin']);
  else if (typeof pkg['bin'] === 'object' && pkg['bin'] !== null) {
    const nb: Record<string, string> = {};
    for (const [k, v] of Object.entries(pkg['bin'] as Record<string, unknown>)) {
      const mv = makeLocalBin(typeof v === 'string' ? v : String(v));
      nb[k] = mv;
    }
    newPkg['bin'] = nb;
  }
}

if (pkg['exports'] !== undefined) {
  const fixed: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(pkg['exports'] as Record<string, unknown>))
    fixed[k] = fixEntryKeepBuild(v);
  newPkg['exports'] = fixed;
}

if (newPkg['exports'] === undefined) {
  const buildEsm = buildEsmDest;
  const exportsObj: Record<string, unknown> = {};

  if (fs.existsSync(buildEsm)) {
    const addExport = (fullPath: string): void => {
      const rel = path.relative(buildEsm, fullPath).split(path.sep).join('/');
      const ext = path.extname(rel);
      if (ext !== '.js' && ext !== '.mjs') return;

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

      const entry: Record<string, string> = {};
      if (fs.existsSync(path.join(publishDir, importPath.replace(/^\.\//, ''))))
        entry['import'] = importPath;
      else return;

      if (fs.existsSync(path.join(publishDir, typesPath.replace(/^\.\//, ''))))
        entry['types'] = typesPath;
      if (fs.existsSync(path.join(publishDir, requirePath.replace(/^\.\//, ''))))
        entry['require'] = requirePath;

      exportsObj[sub] = entry;
    };

    const walk = (dir: string): void => {
      for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, it.name);
        if (it.isDirectory()) walk(full);
        else if (it.isFile()) addExport(full);
      }
    };

    walk(buildEsm);

    exportsObj['./package.json'] = './package.json';

    newPkg['exports'] = exportsObj;
  }
}
const copyIfExists = (name: string): void => {
  const src = path.join(root, name);
  const dest = path.join(publishDir, name);
  if (fs.existsSync(src)) fs.copyFileSync(src, dest);
};
copyIfExists('README.md');
copyIfExists('LICENSE');

if (newPkg.bin === undefined || typeof newPkg.bin === 'string') newPkg.bin = {};
if ((newPkg.bin as Record<string, string>)['zacatl-fix-esm'] === undefined) {
  (newPkg.bin as Record<string, string>)['zacatl-fix-esm'] = 'build/bin/fix-esm.js';
}

if (!newPkg['files']) newPkg['files'] = ['build', 'package.json'];

// Validate every exports/bin target exists in the staged tree — a stale
// entry in the root exports map would otherwise ship as a silently broken
// subpath (the rewrite above does not check target existence).
const missingTargets: string[] = [];
const checkTarget = (subpath: string, target: unknown): void => {
  if (typeof target === 'string') {
    const rel = target.replace(/^\.\//, '');
    // package.json is written by this script after validation
    if (rel === 'package.json') return;
    if (!fs.existsSync(path.join(publishDir, rel))) {
      missingTargets.push(`${subpath} -> ${target}`);
    }
  } else if (target !== null && typeof target === 'object') {
    for (const v of Object.values(target as Record<string, unknown>)) checkTarget(subpath, v);
  }
};
for (const [sub, entry] of Object.entries(
  (newPkg['exports'] ?? {}) as Record<string, unknown>,
)) {
  checkTarget(sub, entry);
}
for (const [name, binPath] of Object.entries((newPkg['bin'] ?? {}) as Record<string, string>)) {
  checkTarget(`bin:${name}`, `./${binPath}`);
}
if (missingTargets.length > 0) {
  // eslint-disable-next-line no-console
  console.error('prepare-publish: exports/bin targets missing from the staged tree:');
  // eslint-disable-next-line no-console
  for (const m of missingTargets) console.error(`  ${m}`);
  process.exit(1);
}

fs.writeFileSync(publishPkgPath, JSON.stringify(newPkg, null, 2) + '\n');
// eslint-disable-next-line no-console
console.log('Wrote', publishPkgPath);
