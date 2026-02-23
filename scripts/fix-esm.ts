#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const targetDir = process.argv[2] || 'build';
let distDir: string;

if (path.isAbsolute(targetDir)) {
  distDir = targetDir;
} else {
  distDir = path.resolve(process.cwd(), targetDir);
  if (!fs.existsSync(distDir) && targetDir === 'build') {
    const rootBuild = path.join(rootDir, 'build');
    if (fs.existsSync(rootBuild)) distDir = rootBuild;
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
} catch (error: any) {
  console.error(`✗ Error fixing ESM exports: ${error?.message ?? error}`);
  process.exit(1);
}
