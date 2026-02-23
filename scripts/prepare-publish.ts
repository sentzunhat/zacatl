import fs from "fs";
import path from "path";

const root = process.cwd();
const pkgPath = path.join(root, "package.json");
const publishDir = path.join(root, "publish");
const publishPkgPath = path.join(publishDir, "package.json");

const pkgRaw = fs.readFileSync(pkgPath, "utf8");
const pkg = JSON.parse(pkgRaw) as any;

function ensureDot(p: unknown) {
  if (typeof p !== "string") return p;
  if (p.startsWith("./") || p.startsWith("/")) return p;
  if (p.startsWith("build/")) return `./${p}`;
  if (p.startsWith("build-cjs/")) return `./${p}`;
  return p;
}

function fixEntryKeepBuild(entry: any): any {
  if (typeof entry === "string") {
    const p = ensureDot(entry) as string;
    return p.replace(/^(\.\/)?build\//, "./build-esm/");
  }
  if (Array.isArray(entry)) return entry.map(fixEntryKeepBuild);
  if (entry && typeof entry === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(entry)) out[k] = fixEntryKeepBuild(v);
    return out;
  }
  return entry;
}

try {
  fs.rmSync(publishDir, { recursive: true, force: true });
} catch (e) {}
fs.mkdirSync(publishDir, { recursive: true });

const buildSrc = path.join(root, "build");
const buildCjsSrc = path.join(root, "build-cjs");
if (fs.existsSync(buildSrc))
  fs.cpSync(buildSrc, path.join(publishDir, "build-esm"), { recursive: true });
if (fs.existsSync(buildCjsSrc))
  fs.cpSync(buildCjsSrc, path.join(publishDir, "build-cjs"), { recursive: true });

// Remove source map files from the publish bundle to avoid publishing
// generated maps (optional: keeps package smaller and avoids exposing
// source through uploaded maps). If you prefer to keep maps for
// debugging, remove this block.
function removeSourceMaps(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) removeSourceMaps(full);
    else if (it.isFile() && full.endsWith(".map")) {
      try {
        fs.rmSync(full);
      } catch (e) {}
    }
  }
}

removeSourceMaps(path.join(publishDir, "build-esm"));
removeSourceMaps(path.join(publishDir, "build-cjs"));

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
  main: pkg.main ? ensureDot(pkg.main) : undefined,
  module: pkg.module
    ? (ensureDot(pkg.module) as string).replace(/^(\.\/)?build\//, "./build-esm/")
    : undefined,
  types: pkg.types
    ? (ensureDot(pkg.types) as string).replace(/^(\.\/)?build\//, "./build-esm/")
    : undefined,
  exports: undefined,
};

// Preserve bin mappings but point them to compiled CJS scripts inside publish
if (pkg.bin) {
  const makeLocalBin = (b: string) => {
    if (!b || typeof b !== "string") return b;
    const p = ensureDot(b) as string;
    return p
      .replace(/^\.\/build-cjs\/scripts\//, "./build-esm/scripts/")
      .replace(/^\.\/build\/scripts\//, "./build-esm/scripts/");
  };
  if (typeof pkg.bin === "string") newPkg.bin = makeLocalBin(pkg.bin);
  else if (typeof pkg.bin === "object") {
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
  const buildEsm = path.join(publishDir, "build-esm");
  const exportsObj: any = {};

  if (fs.existsSync(buildEsm)) {
    function addExportFromFile(fullPath: string) {
      const rel = path.relative(buildEsm, fullPath).split(path.sep).join("/");
      const ext = path.extname(rel);
      if (ext !== ".js" && ext !== ".mjs") return;

      // derive subpath: index files map to their directory, others map to file path without ext
      const parts = rel.split("/");
      const last = parts[parts.length - 1] ?? "";
      const isIndex = last.startsWith("index.");
      const sub = isIndex
        ? parts.length === 1
          ? "."
          : `./${parts.slice(0, -1).join("/")}`
        : `./${rel.slice(0, -ext.length)}`;

      const importPath = `./build-esm/${rel}`;
      const typesPath = `./build-esm/${rel.slice(0, -ext.length)}.d.ts`;
      const requirePath = `./build-cjs/${rel.replace(/\.mjs$/, ".js")}`;

      const entry: any = {};
      if (fs.existsSync(path.join(publishDir, importPath.replace(/^\.\//, ""))))
        entry.import = importPath;
      else return; // skip if import target doesn't actually exist

      if (fs.existsSync(path.join(publishDir, typesPath.replace(/^\.\//, ""))))
        entry.types = typesPath;

      if (fs.existsSync(path.join(publishDir, requirePath.replace(/^\.\//, ""))))
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
    exportsObj["./build/*"] = "./build-esm/*";
    exportsObj["./package.json"] = "./package.json";

    newPkg.exports = exportsObj;
  }
}
const copyIfExists = (name: string) => {
  const src = path.join(root, name);
  const dest = path.join(publishDir, name);
  if (fs.existsSync(src)) fs.copyFileSync(src, dest);
};
copyIfExists("README.md");
copyIfExists("LICENSE");

fs.writeFileSync(publishPkgPath, JSON.stringify(newPkg, null, 2) + "\n");
console.log("Wrote", publishPkgPath);
