import fs from 'fs';
import path from 'path';

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
  if (entry && typeof entry === 'object') {
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
if (!usedEsm) console.warn('No ESM build source found in', esmCandidates);
if (!usedCjs) console.warn('No CJS build source found in', cjsCandidates);

const binDir = path.join(buildDest, 'bin');
fs.mkdirSync(binDir, { recursive: true });

const scriptsCandidates = [
  path.join(root, 'build-scripts-cjs', 'fix-esm.js'),
  path.join(root, 'build-scripts-esm', 'fix-esm.js'),
  // also accept compiled helpers under a `build` subfolder
  path.join(root, 'build-scripts-cjs', 'build', 'fix-esm.js'),
  path.join(root, 'build-scripts-esm', 'build', 'fix-esm.js'),
];

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
    } catch (err: unknown) {
      console.warn(
        `Could not copy bin from ${b}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
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
        } catch (_) {
          /* chmod failures are non-fatal on Windows */
        }
      } catch (err: unknown) {
        console.warn(
          `Could not copy script ${cand}:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }
  }
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
  license?: string | undefined;
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
  bugs: pkg['bugs'],
  author: pkg['author'],
  engines: pkg['engines'],
  peerDependencies: pkg['peerDependencies'],
  dependencies: pkg['dependencies'],
  repository: (() => {
    const repo = pkg['repository'];
    if (repo && typeof repo === 'object' && 'url' in (repo as object)) {
      const r = repo as Record<string, string>;
      const url = r['url'] ?? '';
      return { ...r, url: url.startsWith('git+') ? url : `git+${url}` };
    }
    return repo;
  })(),
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

if (pkg['bin']) {
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

if (pkg['exports']) {
  const fixed: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(pkg['exports'] as Record<string, unknown>))
    fixed[k] = fixEntryKeepBuild(v);
  newPkg['exports'] = fixed;
}

if (!newPkg['exports']) {
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

if (!newPkg.bin || typeof newPkg.bin === 'string') newPkg.bin = {};
if (!(newPkg.bin as Record<string, string>)['zacatl-fix-esm']) {
  (newPkg.bin as Record<string, string>)['zacatl-fix-esm'] = 'build/bin/fix-esm.js';
}

if (!newPkg['files']) newPkg['files'] = ['build', 'package.json'];

fs.writeFileSync(publishPkgPath, JSON.stringify(newPkg, null, 2) + '\n');
console.log('Wrote', publishPkgPath);
