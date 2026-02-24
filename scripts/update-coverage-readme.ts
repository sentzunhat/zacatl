#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
  const lcovPath = path.join(repoRoot, 'coverage', 'lcov.info');
  let lcov: string;
  try {
    lcov = await fs.readFile(lcovPath, 'utf8');
  } catch (_) {
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
  const readme = await fs.readFile(readmePath, 'utf8');

  // Determine badge color by suggested thresholds:
  // green >= 90, yellow >= 75, orange >= 50, red < 50
  const color = (() => {
    if (percent >= 90) return 'brightgreen';
    if (percent >= 75) return 'yellow';
    if (percent >= 50) return 'orange';
    return 'red';
  })();

  // Strict in-place update: replace an existing Coverage badge where found.
  // Patterns handled:
  //  - Linked badge: [![Coverage: 68%](...)](#testing)
  //  - Image-only badge: ![Coverage: 68%](...)
  // The script will fail if no Coverage badge is present (user requested in-place updates).

  const coverageLinkedRegex =
    /\[!\[([^\]]*Coverage[^\]]*)\]\(\s*https?:\/\/img\.shields\.io\/badge\/Coverage-([\d.]+)(?:%25|%)?-([a-zA-Z0-9_-]+)\.svg\s*\)\]\(\s*([^)]*)\s*\)/i;
  const coverageImageRegex =
    /!\[([^\]]*Coverage[^\]]*)\]\(\s*https?:\/\/img\.shields\.io\/badge\/Coverage-([\d.]+)(?:%25|%)?-([a-zA-Z0-9_-]+)\.svg\s*\)/i;

  let newReadme = readme;
  const newBadgeUrl = `https://img.shields.io/badge/Coverage-${encodeURIComponent(
    percentStr + '%',
  )}-${color}.svg`;

  const linkedMatch = coverageLinkedRegex.exec(readme);
  if (linkedMatch) {
    const alt = (linkedMatch[1] || 'Coverage: ').replace(/[\d.]+%/, `${percentStr}%`);
    const anchor = linkedMatch[4] || '#testing';
    const replacement = `[![${alt}](${newBadgeUrl})](${anchor})`;
    newReadme = readme.replace(coverageLinkedRegex, replacement);
  } else {
    const imgMatch = coverageImageRegex.exec(readme);
    if (imgMatch) {
      const alt = (imgMatch[1] || 'Coverage: ').replace(/[\d.]+%/, `${percentStr}%`);
      const replacement = `![${alt}](${newBadgeUrl})`;
      newReadme = readme.replace(coverageImageRegex, replacement);
    } else {
      console.error(
        'No existing Coverage badge found in README.md — updater requires an existing badge to update in-place.',
      );
      process.exit(1);
    }
  }

  // Now update Tests badge in-place. Require TEST_COUNT env or a results JSON.
  const testCountEnv = process.env['TEST_COUNT'];
  let testCount: number | undefined = testCountEnv ? Number(testCountEnv) || undefined : undefined;

  async function tryReadJson(p: string) {
    try {
      const full = path.join(repoRoot, p);
      const txt = await fs.readFile(full, 'utf8');
      return JSON.parse(txt);
    } catch (_) {
      return undefined;
    }
  }

  if (!testCount) {
    const candidates = [
      'test-results.json',
      'vitest-report.json',
      './test-results.json',
      './coverage/test-results.json',
    ];
    for (const c of candidates) {
      const j = await tryReadJson(c);
      if (j) {
        if (typeof j.numTotalTests === 'number') {
          testCount = j.numTotalTests;
          break;
        }
        if (j.stats && typeof j.stats.tests === 'number') {
          testCount = j.stats.tests;
          break;
        }
        if (typeof j.tests === 'number') {
          testCount = j.tests;
          break;
        }
      }
    }
  }

  // Fallback: some CI/test runners may have mixed reporter output (logs + JSON)
  // so the redirected file contains plain text. Try to parse a test-count from
  // such plain output files (e.g. `test-results.json` that actually contains logs).
  if (!testCount) {
    const txtCandidates = [
      'test-results.json',
      './test-results.json',
      './coverage/test-results.txt',
    ];
    for (const c of txtCandidates) {
      try {
        const full = path.join(repoRoot, c);
        const txt = await fs.readFile(full, 'utf8');
        // Try patterns like: "Tests  307 passed (307)", "Tests: 307", or "307 tests"
        // Prefer explicit summary-like patterns (e.g. "Tests  307 passed (307)")
        const patterns = [
          /Tests[^\d]{0,10}(\d{1,6})\s+passed/i,
          /Tests\s*:\s*(\d{1,6})/i,
          /numTotalTests\W*(\d{1,6})/i,
          /"stats"\s*:[^{]*\{[^}]*"tests"\s*:\s*(\d{1,6})/i,
          /\b(\d{1,6})\s+tests?\b/i,
          /\b(\d{1,6})\s+passed\b/i,
        ];
        for (const p of patterns) {
          const m = p.exec(txt);
          if (m && m[1]) {
            testCount = Number(m[1]);
            break;
          }
        }
        if (testCount) break;
      } catch (_) {
        // ignore
      }
    }
  }

  if (!testCount) {
    console.error(
      'No test count available (set TEST_COUNT or generate a test-results JSON); updater requires an existing Tests badge and a test count to update in-place.',
    );
    process.exit(1);
  }

  const testsLinkedRegex =
    /\[!\[Tests:\s*([\d]+)\]\(https?:\/\/img\.shields\.io\/badge\/Tests-([\d]+)-([a-zA-Z0-9_%-]+)\.svg\)\]\([^)]*\)/i;
  const testsImageRegex =
    /!\[Tests:\s*([\d]+)\]\(https?:\/\/img\.shields\.io\/badge\/Tests-([\d]+)-([a-zA-Z0-9_%-]+)\.svg\)/i;

  if (testsLinkedRegex.test(newReadme)) {
    newReadme = newReadme.replace(
      testsLinkedRegex,
      (_match: string, g1: string, g2: string, color?: string) => {
        const c = color || 'blue';
        return `[![Tests: ${testCount}](https://img.shields.io/badge/Tests-${testCount}-${c}.svg)](#testing)`;
      },
    );
  } else if (testsImageRegex.test(newReadme)) {
    newReadme = newReadme.replace(
      testsImageRegex,
      (_match: string, g1: string, g2: string, color?: string) => {
        const c = color || 'blue';
        return `![Tests: ${testCount}](https://img.shields.io/badge/Tests-${testCount}-${c}.svg)`;
      },
    );
  } else {
    console.error(
      'No existing Tests badge found in README.md — updater requires an existing Tests badge to update in-place.',
    );
    process.exit(1);
  }

  // Write updated README (only modified in-place, order preserved)
  await fs.writeFile(readmePath, newReadme, 'utf8');
  console.log(`Updated README.md coverage to ${percentStr}% and tests to ${testCount}`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.stack || err.message : String(err);
  console.error(msg);
  process.exit(1);
});
