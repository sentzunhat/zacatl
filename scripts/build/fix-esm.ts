#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

function findRepoRoot(startDir: string): string {
  let cur = startDir;
  for (let i = 0; i < 6; i++) {
    const pkg = path.join(cur, 'package.json');
    if (fs.existsSync(pkg)) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return startDir;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptDir = __dirname;
const rootDir = findRepoRoot(scriptDir);

const targetDir = process.argv[2] || 'build-src-esm';
let distDir: string;

if (path.isAbsolute(targetDir)) {
  distDir = targetDir;
} else {
  distDir = path.resolve(process.cwd(), targetDir);
  if (!fs.existsSync(distDir)) {
    const candidates = [
      'build-src-esm',
      'build-scripts-esm',
      'build-esm',
      'build',
      'publish/build-esm',
    ];
    for (const cand of candidates) {
      const candPath = path.join(rootDir, cand);
      if (fs.existsSync(candPath)) {
        distDir = candPath;
        break;
      }
    }
  }
}

if (!fs.existsSync(distDir)) {
  console.error(`✗ Directory not found: ${distDir}`);
  process.exit(1);
}

function walkDir(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name.startsWith('.')) continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...walkDir(fullPath));
    else if (item.isFile() && item.name.endsWith('.js')) files.push(fullPath);
  }
  return files;
}

function fixFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  const fileDir = path.dirname(filePath);

  const patterns = [
    /export\s+(?:\*|\{[^}]+\})\s+from\s+["'](\.[^"']*?)(?<!\.js)["']/g,
    /import\s+(?:(?:\{[^}]+\}|[\w]+)(?:\s*,\s*(?:\{[^}]+\}|[\w]+))*\s+from\s+)?["'](\.[^"']*?)(?<!\.js)["']/g,
    /import\(["'](\.[^"']*?)(?<!\.js)["']\)/g,
  ];

  patterns.forEach((pattern) => {
    content = content.replace(pattern, (match, importPath: string) => {
      if (importPath.endsWith('.json')) return match;
      const resolvedPath = path.resolve(fileDir, importPath);
      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
        return match
          .replace(`"${importPath}"`, `"${importPath}/index.js"`)
          .replace(`'${importPath}'`, `'${importPath}/index.js'`);
      } else {
        return match
          .replace(`"${importPath}"`, `"${importPath}.js"`)
          .replace(`'${importPath}'`, `'${importPath}.js'`);
      }
    });
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

try {
  const files = walkDir(distDir);
  let fixed = 0;
  for (const file of files) if (fixFile(file)) fixed++;
  console.log(`✓ Fixed ESM exports: ${fixed} file(s) updated`);
  process.exit(0);
} catch (error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`✗ Error fixing ESM exports: ${msg}`);
  process.exit(1);
}
