import fs from "fs";
import path from "path";

const root = process.cwd();
const pkgPath = path.join(root, "package.json");
const buildPkgPath = path.join(root, "build", "package.json");

const pkgRaw = fs.readFileSync(pkgPath, "utf8");
const pkg = JSON.parse(pkgRaw);

function fixString(p) {
  return typeof p === "string" ? p.replace(/^\.\/build\//, "./") : p;
}

function fixEntry(entry) {
  if (typeof entry === "string") return fixString(entry);
  if (Array.isArray(entry)) return entry.map(fixEntry);
  if (entry && typeof entry === "object") {
    const out = {};
    for (const [k, v] of Object.entries(entry)) out[k] = fixEntry(v);
    return out;
  }
  return entry;
}

const newPkg = {
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
  main: pkg.main ? pkg.main.replace(/^build\//, "") : undefined,
  module: pkg.module ? pkg.module.replace(/^build\//, "") : undefined,
  types: pkg.types ? pkg.types.replace(/^build\//, "") : undefined,
  exports: undefined,
};

if (pkg.exports) {
  const fixed = {};
  for (const [k, v] of Object.entries(pkg.exports)) {
    fixed[k] = fixEntry(v);
  }
  newPkg.exports = fixed;
}

// Ensure package.json in build does not include scripts, files, or dev-only fields
// Write the adjusted package.json into build/
fs.writeFileSync(buildPkgPath, JSON.stringify(newPkg, null, 2) + "\n");
console.log("Wrote", buildPkgPath);
