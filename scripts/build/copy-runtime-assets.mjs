#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../..');

const buildDirectories = {
  esm: 'build-src-esm',
  cjs: 'build-src-cjs',
};

const assetMappings = [
  {
    source: 'src/third-party/eslint',
    destination: 'third-party/eslint',
    requiredFiles: [
      'index.mjs',
      'base.mjs',
      'best-practices.mjs',
      'file-naming.mjs',
      'imports.mjs',
      'naming-conventions.mjs',
      'scripts.mjs',
      'solid.mjs',
      'strict.mjs',
      'tests.mjs',
      'type-safety.mjs',
    ],
  },
  {
    source: 'src/third-party/localization/locales',
    destination: 'third-party/localization/locales',
    requiredFiles: ['en.json', 'es.json'],
  },
];

const fail = (message) => {
  throw new Error(message);
};

const validateAssetSource = ({ source, requiredFiles }) => {
  const sourcePath = path.join(repositoryRoot, source);
  let sourceStat;
  try {
    sourceStat = fs.statSync(sourcePath);
  } catch (error) {
    fail(`Required runtime asset source is missing: ${sourcePath} (${error.message})`);
  }

  if (!sourceStat.isDirectory()) {
    fail(`Required runtime asset source is not a directory: ${sourcePath}`);
  }

  for (const requiredFile of requiredFiles) {
    const requiredPath = path.join(sourcePath, requiredFile);
    let requiredStat;
    try {
      requiredStat = fs.statSync(requiredPath);
    } catch (error) {
      fail(`Required runtime asset is missing: ${requiredPath} (${error.message})`);
    }

    if (!requiredStat.isFile()) {
      fail(`Required runtime asset is not a file: ${requiredPath}`);
    }
  }

  return sourcePath;
};

const main = () => {
  const target = process.argv[2];
  if (process.argv.length !== 3 || !Object.hasOwn(buildDirectories, target)) {
    fail('Usage: node scripts/build/copy-runtime-assets.mjs <esm|cjs>');
  }

  const buildDirectory = path.join(repositoryRoot, buildDirectories[target]);
  let buildStat;
  try {
    buildStat = fs.statSync(buildDirectory);
  } catch (error) {
    fail(`Build output directory is missing: ${buildDirectory} (${error.message})`);
  }

  if (!buildStat.isDirectory()) {
    fail(`Build output path is not a directory: ${buildDirectory}`);
  }

  for (const mapping of assetMappings) {
    const sourcePath = validateAssetSource(mapping);
    const destinationPath = path.join(buildDirectory, mapping.destination);

    fs.rmSync(destinationPath, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.cpSync(sourcePath, destinationPath, { recursive: true, force: true });

    console.log(
      `Copied ${path.relative(repositoryRoot, sourcePath)} -> ${path.relative(repositoryRoot, destinationPath)}`,
    );
  }
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
