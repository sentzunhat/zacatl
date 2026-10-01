#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

import { measureTime } from '../utils/measure-time.js';

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

      // Rewrites only the number (and optionally the color) of a shields.io
      // badge such as `![Coverage: 91.4%](…/badge/coverage-91.4%25-brightgreen.svg?style=flat-square)`,
      // keeping its label, message text, style query and surrounding link.
      const updateBadge = (
        text: string,
        name: 'Coverage' | 'Tests',
        value: string,
        badgeColor?: string,
      ): string | null => {
        const badgeRegex = new RegExp(
          `!\\[${name}:[^\\]]*\\]\\((https?:\\/\\/img\\.shields\\.io\\/badge\\/)([^-/)]+)-([^)]*?)-([A-Za-z0-9_]+)\\.svg(\\?[^)]*)?\\)`,
          'i',
        );
        const match = badgeRegex.exec(text);
        if (match == null) return null;

        const [whole, base, label, message = '', oldColor, query = ''] = match;
        const alt = name === 'Coverage' ? `${name}: ${value}%` : `${name}: ${value}`;
        const updated = `![${alt}](${base}${label}-${message.replace(/[\d.]+/, value)}-${
          badgeColor ?? oldColor
        }.svg${query})`;
        return text.replace(whole, updated);
      };

      const withCoverage = updateBadge(readme, 'Coverage', percentStr, color);
      if (withCoverage == null) {
        // eslint-disable-next-line no-console
        console.error('No Coverage badge found in README.md to update.');
        process.exit(1);
      }
      let newReadme = withCoverage;

      const testCountEnv = process.env['TEST_COUNT'];
      let testCount = testCountEnv !== undefined ? Number(testCountEnv) || 0 : 0;
      let testFileCount = 0;

      const resultsPath = path.join(repoRoot, 'test-results.json');
      try {
        const raw = await fs.readFile(resultsPath, 'utf8');
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed?.testResults)) {
          testFileCount = parsed.testResults.length;
        }

        const deriveCount = (obj: unknown): number => {
          if (obj === null || typeof obj !== 'object') return 0;
          const anyObj = obj as Record<string, unknown>;
          if (typeof anyObj['numTotalTests'] === 'number') return anyObj['numTotalTests'] as number;
          if (typeof anyObj['total'] === 'number') return anyObj['total'] as number;
          const statsValue = anyObj['stats'];
          if (statsValue !== null && typeof statsValue === 'object') {
            const stats = statsValue as Record<string, unknown>;
            if (typeof stats['tests'] === 'number') return stats['tests'] as number;
            if (typeof stats['numTotalTests'] === 'number') return stats['numTotalTests'] as number;
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
            if (v > 0) return v;
          }
          return 0;
        };

        if (testCount === 0) testCount = deriveCount(parsed) || 0;
      } catch {
        // ignore and fall back to TEST_COUNT or 0
      }

      if (testCount > 0) {
        newReadme = updateBadge(newReadme, 'Tests', String(testCount)) ?? newReadme;
        // Testing section prose, e.g. "671 tests across 80 files, 91.82% line coverage".
        newReadme = newReadme.replace(
          /^(\d+) tests across (\d+) files, [\d.]+%\+? line coverage/m,
          (_m, _tests, files) => {
            const fileCount = testFileCount > 0 ? testFileCount : Number(files);
            return `${testCount} tests across ${fileCount} files, ${percentStr}% line coverage`;
          },
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
