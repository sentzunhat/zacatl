import fs from 'node:fs';
import path from 'node:path';

const [, , rootDirArg] = process.argv;

if (rootDirArg == null) {
  // eslint-disable-next-line no-console
  console.error('Usage: node rewrite-runtime-aliases.js <rootDir>');
  process.exit(1);
}

const rootDir = path.resolve(process.cwd(), rootDirArg);
const fileExtensions = new Set(['.js', '.mjs', '.cjs']);
const replacements = [
  ['@zacatl/third-party/reflect-metadata', '@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata'],
  ['@zacatl/third-party/tsyringe', '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe'],
  ['@zacatl/third-party/sequelize', '@sentzunhat/zacatl/third-party/databases/sequelize'],
  ['@zacatl/third-party/sqlite3', '@sentzunhat/zacatl/third-party/databases/sqlite3'],
  ['@zacatl/third-party/mongoose', '@sentzunhat/zacatl/third-party/databases/mongoose'],
  ['@zacatl/service/', '@sentzunhat/zacatl/service/'],
  ['@zacatl/error/', '@sentzunhat/zacatl/error/'],
  ['@zacatl/service', '@sentzunhat/zacatl/service'],
  ['@zacatl/error', '@sentzunhat/zacatl/error'],
  ['@zacatl/third-party/', '@sentzunhat/zacatl/third-party/'],
];

const rewriteFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let nextContent = content;

  for (const [from, to] of replacements) {
    nextContent = nextContent.replaceAll(from, to);
  }

  if (nextContent !== content) {
    fs.writeFileSync(filePath, nextContent, 'utf8');
  }
};

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && fileExtensions.has(path.extname(entry.name))) {
      rewriteFile(fullPath);
    }
  }
};

walk(rootDir);
