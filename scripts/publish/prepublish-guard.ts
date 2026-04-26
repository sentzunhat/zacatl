#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const packagePath = resolve(root, 'package.json');
const changelogPath = resolve(root, 'docs/changelog.md');
const skipGuard = process.env['SKIP_PREPUBLISH_GUARD'] === '1';
const skipGuardReason = (process.env['SKIP_PREPUBLISH_GUARD_REASON'] ?? '').trim();

const fail = (message: string): void => {
  // eslint-disable-next-line no-console
  console.error(`❌ prepublish guard failed: ${message}`);
  process.exit(1);
};

const warn = (message: string): void => {
  // eslint-disable-next-line no-console
  console.warn(`⚠️  prepublish guard warning: ${message}`);
};

const pass = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(`✅ ${message}`);
};

if (skipGuard) {
  if (skipGuardReason.length === 0) {
    fail(
      'SKIP_PREPUBLISH_GUARD=1 requires SKIP_PREPUBLISH_GUARD_REASON with a non-empty emergency reason',
    );
  }
  warn(`Bypassing prepublish guard due to emergency override. Reason: ${skipGuardReason}`);
  process.exit(0);
}

let packageJsonRaw: Record<string, unknown> | undefined;
try {
  packageJsonRaw = JSON.parse(readFileSync(packagePath, 'utf8')) as Record<string, unknown>;
} catch {
  fail('Unable to read package.json');
}

if (!packageJsonRaw) fail('Unable to read package.json');
const packageJson = packageJsonRaw ?? {};

const packageName = typeof packageJson['name'] === 'string' ? packageJson['name'] : '';
const packageVersion = typeof packageJson['version'] === 'string' ? packageJson['version'] : '';

if (packageName.length === 0 || packageVersion.length === 0) {
  fail('package.json must include both name and version');
}

let changelogContent: string = '';
try {
  changelogContent = readFileSync(changelogPath, 'utf8');
} catch {
  fail('Unable to read docs/changelog.md');
}

const lines = changelogContent.split(/\r?\n/);
const firstSeparatorIndex = lines.findIndex((line) => line.trim() === '---');
if (firstSeparatorIndex === -1) fail("docs/changelog.md is missing the top '---' separator");

const headerRegex = /^## \[([^\]]+)\]/;
const firstEntryLine = lines.slice(firstSeparatorIndex + 1).find((line) => headerRegex.test(line));
if (firstEntryLine === undefined) {
  fail('docs/changelog.md has no release entry after the top separator');
}

const match = (firstEntryLine?.match(headerRegex) ?? []) as RegExpMatchArray;
const topVersion = match[1];
if (topVersion === undefined || topVersion.length === 0) {
  fail('Unable to parse top changelog version entry');
}

if (topVersion !== packageVersion) {
  fail(
    `Top changelog version (${topVersion}) does not match package.json version (${packageVersion})`,
  );
}

pass(`Version alignment passed for ${packageName}@${packageVersion}`);

let publishedVersions: string[] = [];
try {
  const output = execSync(`npm view ${packageName} versions --json`, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  const parsed = JSON.parse(output);
  publishedVersions = Array.isArray(parsed) ? parsed : parsed != null ? [parsed] : [];
} catch (err: unknown) {
  let stderr = '';
  if (err !== null && typeof err === 'object') {
    const maybe = err as { stderr?: unknown };
    if (maybe.stderr != null)
      stderr = typeof maybe.stderr === 'string' ? maybe.stderr : String(maybe.stderr);
  }
  if (stderr.includes('E404')) {
    warn(`${packageName} is not yet published on npm (E404). Proceeding.`);
    process.exit(0);
  }
  fail('Unable to query npm registry for published versions');
}

if (publishedVersions.includes(packageVersion)) {
  fail(`Version ${packageVersion} is already published to npm for ${packageName}`);
}

pass(`Published-version check passed: ${packageVersion} is not on npm yet`);
