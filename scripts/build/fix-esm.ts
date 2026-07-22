#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { measureTime } from '../utils/measure-time.js';

const findRepoRoot = (startDir: string): string => {
  let cur = startDir;
  for (let i = 0; i < 6; i++) {
    const pkg = path.join(cur, 'package.json');
    if (fs.existsSync(pkg)) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return startDir;
};

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
  // eslint-disable-next-line no-console
  console.error(`✗ Directory not found: ${distDir}`);
  process.exit(1);
}

const isFixableFile = (name: string): boolean => name.endsWith('.js') || name.endsWith('.d.ts');

const walkDir = (dir: string): string[] => {
  const files: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name.startsWith('.')) continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...walkDir(fullPath));
    else if (item.isFile() && isFixableFile(item.name)) files.push(fullPath);
  }
  return files;
};

const hasKnownExtension = (importPath: string): boolean => {
  return (
    importPath.endsWith('.js') ||
    importPath.endsWith('.mjs') ||
    importPath.endsWith('.cjs') ||
    importPath.endsWith('.json')
  );
};

const resolveSpecifier = (fileDir: string, importPath: string): string => {
  if (hasKnownExtension(importPath)) return importPath;

  const resolvedPath = path.resolve(fileDir, importPath);

  // Runtime ESM and NodeNext declaration resolution both use the runtime JS
  // specifier. For declarations, TypeScript follows `./foo.js` to `foo.d.ts`.
  if (fs.existsSync(`${resolvedPath}.js`) || fs.existsSync(`${resolvedPath}.d.ts`)) {
    return `${importPath}.js`;
  }

  if (
    fs.existsSync(path.join(resolvedPath, 'index.js')) ||
    fs.existsSync(path.join(resolvedPath, 'index.d.ts'))
  ) {
    return `${importPath}/index.js`;
  }

  return `${importPath}.js`;
};

const fixFile = (filePath: string): boolean => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  const fileDir = path.dirname(filePath);

  const patterns = [
    /(from\s+["'])(\.[^"']*?)(["'])/g,
    /(import\s+["'])(\.[^"']*?)(["'])/g,
    /(import\(\s*["'])(\.[^"']*?)(["']\s*\))/g,
  ];

  patterns.forEach((pattern) => {
    content = content.replace(
      pattern,
      (match, prefix: string, importPath: string, suffix: string) => {
        return `${prefix}${resolveSpecifier(fileDir, importPath)}${suffix}`;
      },
    );
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  return false;
};

await measureTime({
  name: 'fix-esm',
  fn: () => {
    const files = walkDir(distDir);
    let fixedCount = 0;
    for (const file of files) {
      if (fixFile(file)) fixedCount++;
    }

    // eslint-disable-next-line no-console
    console.log(`✓ Fixed ESM imports in ${fixedCount} files`);
  },
});
