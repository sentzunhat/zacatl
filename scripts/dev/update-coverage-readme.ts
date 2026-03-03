#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

import { measureTime } from '../utils/index.js';

const main = async (): Promise<void> => {
  await measureTime({
    name: 'update-readme',
    fn: async () => {
      const repoRoot = path.resolve(process.cwd());
      const lcovPath = path.join(repoRoot, 'coverage', 'lcov.info');
      let lcov: string;
      try {
        lcov = await fs.readFile(lcovPath, 'utf8');
      } catch {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        newReadme = readme.replace(
          coverageImageRegex,
          `![Coverage: ${percentStr}%](${newBadgeUrl})`,
        );
      } else {
        // eslint-disable-next-line no-console
        console.error('No Coverage badge found in README.md to update.');
        process.exit(1);
      }

      const testCountEnv = process.env['TEST_COUNT'];
      let testCount = testCountEnv ? Number(testCountEnv) || 0 : 0;

      if (!testCount) {
        const resultsPath = path.join(repoRoot, 'test-results.json');
        try {
          const raw = await fs.readFile(resultsPath, 'utf8');
          const parsed = JSON.parse(raw);

          const deriveCount = (obj: unknown): number => {
            if (!obj || typeof obj !== 'object') return 0;
            const anyObj = obj as Record<string, unknown>;
            if (typeof anyObj['numTotalTests'] === 'number')
              return anyObj['numTotalTests'] as number;
            if (typeof anyObj['total'] === 'number') return anyObj['total'] as number;
            if (anyObj['stats'] && typeof anyObj['stats'] === 'object') {
              const stats = anyObj['stats'] as Record<string, unknown>;
              if (typeof stats['tests'] === 'number') return stats['tests'] as number;
              if (typeof stats['numTotalTests'] === 'number')
                return stats['numTotalTests'] as number;
            }
            if (Array.isArray(anyObj['testResults'])) {
              return (anyObj['testResults'] as Array<Record<string, unknown>>).reduce((acc, r) => {
                if (typeof r['numPassingTests'] === 'number')
                  return acc + (r['numPassingTests'] as number);
                if (Array.isArray(r['assertionResults']))
                  return acc + (r['assertionResults'] as Array<unknown>).length;
                return acc;
              }, 0);
            }
            for (const k of Object.keys(anyObj)) {
              const v = deriveCount(anyObj[k]);
              if (v && v > 0) return v;
            }
            return 0;
          };

          testCount = deriveCount(parsed) || 0;
        } catch {
          // ignore and fall back to 0
        }
      }
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
      // eslint-disable-next-line no-console
      console.log(`Updated README.md coverage to ${percentStr}% and tests to ${testCount}`);
    },
  });
};

void main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
