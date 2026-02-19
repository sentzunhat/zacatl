#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const packagePath = resolve(root, "package.json");
const changelogPath = resolve(root, "docs/changelog.md");
const skipGuard = process.env.SKIP_PREPUBLISH_GUARD === "1";
const skipGuardReason = process.env.SKIP_PREPUBLISH_GUARD_REASON?.trim();

const fail = (message) => {
  console.error(`❌ prepublish guard failed: ${message}`);
  process.exit(1);
};

const warn = (message) => {
  console.warn(`⚠️  prepublish guard warning: ${message}`);
};

const pass = (message) => {
  console.log(`✅ ${message}`);
};

if (skipGuard) {
  if (!skipGuardReason) {
    fail(
      "SKIP_PREPUBLISH_GUARD=1 requires SKIP_PREPUBLISH_GUARD_REASON with a non-empty emergency reason",
    );
  }

  warn(
    `Bypassing prepublish guard due to emergency override. Reason: ${skipGuardReason}`,
  );
  process.exit(0);
}

let packageJson;
try {
  packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
} catch {
  fail("Unable to read package.json");
}

const packageName = packageJson.name;
const packageVersion = packageJson.version;

if (!packageName || !packageVersion) {
  fail("package.json must include both name and version");
}

let changelogContent;
try {
  changelogContent = readFileSync(changelogPath, "utf8");
} catch {
  fail("Unable to read docs/changelog.md");
}

const lines = changelogContent.split(/\r?\n/);
const firstSeparatorIndex = lines.findIndex((line) => line.trim() === "---");
if (firstSeparatorIndex === -1) {
  fail("docs/changelog.md is missing the top '---' separator");
}

const headerRegex = /^## \[([^\]]+)\]/;
const firstEntryLine = lines
  .slice(firstSeparatorIndex + 1)
  .find((line) => headerRegex.test(line));
if (!firstEntryLine) {
  fail("docs/changelog.md has no release entry after the top separator");
}

const [, topVersion] = firstEntryLine.match(headerRegex) ?? [];
if (!topVersion) {
  fail("Unable to parse top changelog version entry");
}

if (topVersion !== packageVersion) {
  fail(
    `Top changelog version (${topVersion}) does not match package.json version (${packageVersion})`,
  );
}

pass(`Version alignment passed for ${packageName}@${packageVersion}`);

let publishedVersions = [];
try {
  const output = execSync(`npm view ${packageName} versions --json`, {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
  const parsed = JSON.parse(output);
  publishedVersions = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
} catch (error) {
  const stderr = error?.stderr?.toString?.() ?? "";
  if (stderr.includes("E404")) {
    warn(`${packageName} is not yet published on npm (E404). Proceeding.`);
    process.exit(0);
  }
  fail("Unable to query npm registry for published versions");
}

if (publishedVersions.includes(packageVersion)) {
  fail(
    `Version ${packageVersion} is already published to npm for ${packageName}`,
  );
}

pass(`Published-version check passed: ${packageVersion} is not on npm yet`);
