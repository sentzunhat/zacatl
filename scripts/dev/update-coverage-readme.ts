#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const repoRoot = path.resolve(process.cwd());
  const lcovPath = path.join(repoRoot, 'coverage', 'lcov.info');
  let lcov: string;
  try {
    lcov = await fs.readFile(lcovPath, 'utf8');
  } catch {
    console.error('coverage/lcov.info not found. Run tests with coverage first.');
    process.exit(1);
  }

  let totalLF = 0;
  let totalLH = 0;
  for (const line of lcov.split(/\r?\n/)) {
    if (line.startsWith('LF:')) totalLF += Number(line.slice(3)) || 0;
    if (line.startsWith('LH:')) totalLH += Number(line.slice(3)) || 0;
  }

  const percent = totalLF > 0 ? (totalLH / totalLF) * 100 : 0;
  const percentStr = percent.toFixed(2);

  const readmePath = path.join(repoRoot, 'README.md');
  let readme: string;
  try {
    readme = await fs.readFile(readmePath, 'utf8');
  } catch {
    console.error('README.md not found');
    process.exit(1);
  }

  const color =
    percent >= 90 ? 'brightgreen' : percent >= 75 ? 'yellow' : percent >= 50 ? 'orange' : 'red';

  const coverageLinkedRegex =
    /\[!\[[^\]]*Coverage[^\]]*\]\(\s*https?:\/\/img\.shields\.io\/badge\/Coverage-([\d.]+)(?:%25|%)?-([a-zA-Z0-9_-]+)\.svg\s*\)\]\([^)]*\)/i;
  const coverageImageRegex =
    /!\[[^\]]*Coverage[^\]]*\]\(\s*https?:\/\/img\.shields\.io\/badge\/Coverage-([\d.]+)(?:%25|%)?-([a-zA-Z0-9_-]+)\.svg\s*\)/i;

  const newBadgeUrl = `https://img.shields.io/badge/Coverage-${encodeURIComponent(
    percentStr + '%',
  )}-${color}.svg`;
  let newReadme = readme;

  if (coverageLinkedRegex.test(readme)) {
    newReadme = readme.replace(coverageLinkedRegex, (m) => {
      const linkTargetMatch = /\]\(([^)]*)\)\]/.exec(m);
      const linkTarget = linkTargetMatch ? linkTargetMatch[1] : '#testing';
      return `[![Coverage: ${percentStr}%](${newBadgeUrl})](${linkTarget})`;
    });
  } else if (coverageImageRegex.test(readme)) {
    newReadme = readme.replace(coverageImageRegex, `![Coverage: ${percentStr}%](${newBadgeUrl})`);
  } else {
    console.error('No Coverage badge found in README.md to update.');
    process.exit(1);
  }

  const testCountEnv = process.env['TEST_COUNT'];
  const testCount = testCountEnv ? Number(testCountEnv) || 0 : 0;
  const testsLinkedRegex =
    /\[!\[Tests:\s*(\d+)\]\(https?:\/\/img\.shields\.io\/badge\/Tests-(\d+)-([a-zA-Z0-9_%-]+)\.svg\)\]\([^)]*\)/i;
  const testsImageRegex =
    /!\[Tests:\s*(\d+)\]\(https?:\/\/img\.shields\.io\/badge\/Tests-(\d+)-([a-zA-Z0-9_%-]+)\.svg\)/i;

  if (testsLinkedRegex.test(newReadme)) {
    newReadme = newReadme.replace(
      testsLinkedRegex,
      `[![Tests: ${testCount}](https://img.shields.io/badge/Tests-${testCount}-blue.svg)](#tests)`,
    );
  } else if (testsImageRegex.test(newReadme)) {
    newReadme = newReadme.replace(
      testsImageRegex,
      `![Tests: ${testCount}](https://img.shields.io/badge/Tests-${testCount}-blue.svg)`,
    );
  }

  await fs.writeFile(readmePath, newReadme, 'utf8');
  console.log(`Updated README.md coverage to ${percentStr}% and tests to ${testCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
