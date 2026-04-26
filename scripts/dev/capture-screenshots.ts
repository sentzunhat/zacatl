/**
 * Playwright screenshot automation for all 8 Zacatl examples.
 *
 * Captures 3 states per example:
 *   01-initial.png      — empty list on first load
 *   02-after-create.png — one greeting created and visible
 *   03-after-delete.png — greeting deleted, list empty again
 *
 * Output: examples/screenshots/{example-name}/
 *
 * When to run:
 *   Re-run this script whenever you change any example's frontend UI and
 *   commit the updated PNGs alongside your code changes. Screenshots are
 *   embedded in examples/README.md and serve as the visual record of each
 *   example's CRUD flow.
 *
 * Usage:
 *   npm run screenshots:examples:capture
 *
 * Prerequisites:
 *   - Docker running
 *   - npx playwright install chromium  (one-time setup)
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../');
const SCREENSHOTS_ROOT = path.join(REPO_ROOT, 'examples/screenshots');

interface ExampleConfig {
  name: string;
  composeDir: string;
  port: number;
}

const EXAMPLES: ExampleConfig[] = [
  { name: 'fastify-sqlite-react',  composeDir: 'examples/fastify-sqlite-react',  port: 8081 },
  { name: 'fastify-sqlite-svelte', composeDir: 'examples/fastify-sqlite-svelte', port: 8085 },
  { name: 'fastify-postgres-react', composeDir: 'examples/fastify-postgres-react', port: 8083 },
  { name: 'fastify-mongodb-react', composeDir: 'examples/fastify-mongodb-react', port: 8082 },
  { name: 'express-sqlite-react',  composeDir: 'examples/express-sqlite-react',  port: 8181 },
  // express-sqlite-svelte shares host port 8181 — runs after express-sqlite-react is stopped
  { name: 'express-sqlite-svelte', composeDir: 'examples/express-sqlite-svelte', port: 8181 },
  { name: 'express-postgres-react', composeDir: 'examples/express-postgres-react', port: 8183 },
  { name: 'express-mongodb-react', composeDir: 'examples/express-mongodb-react', port: 8182 },
];

function compose(composeDir: string, args: string): void {
  const composePath = path.join(REPO_ROOT, composeDir, 'docker-compose.yml');
  execSync(`docker compose -f "${composePath}" ${args}`, { cwd: REPO_ROOT, stdio: 'inherit' });
}

async function waitForReady(port: number, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const result = spawnSync('curl', ['-sf', `http://localhost:${port}`], { timeout: 3000 });
      if (result.status === 0 || result.status === 22) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timeout waiting for port ${port}`);
}

async function screenshotExample(
  example: ExampleConfig,
  browser: Awaited<ReturnType<typeof chromium.launch>>,
): Promise<void> {
  const outDir = path.join(SCREENSHOTS_ROOT, example.name);
  fs.mkdirSync(outDir, { recursive: true });

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(`http://localhost:${example.port}`, { waitUntil: 'networkidle' });
    await page.locator('main, h1').first().waitFor({ state: 'visible', timeout: 15_000 });
    await page.screenshot({ path: path.join(outDir, '01-initial.png'), fullPage: true });
    console.log(`  📸 01-initial.png`);

    // Target the first form's inputs by position — message [0], language [1].
    // This is robust across the different layouts (React textarea vs Svelte input).
    await page.locator('form input, form textarea').first().waitFor({ state: 'visible', timeout: 15_000 });
    const firstFormInputs = page.locator('form').first().locator('input, textarea');
    await firstFormInputs.nth(0).fill('Hello from Zacatl!');
    await firstFormInputs.nth(1).fill('en');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('article, ul li').first().waitFor({ state: 'visible', timeout: 10_000 });
    await page.screenshot({ path: path.join(outDir, '02-after-create.png'), fullPage: true });
    console.log(`  📸 02-after-create.png`);

    await page.locator('button:has-text("Delete"), button:has-text("Remove")').first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('article, ul li').first().waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    await page.screenshot({ path: path.join(outDir, '03-after-delete.png'), fullPage: true });
    console.log(`  📸 03-after-delete.png`);
  } finally {
    await context.close();
  }
}

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true });

  try {
    for (const example of EXAMPLES) {
      console.log(`\n▶  ${example.name}`);
      compose(example.composeDir, 'up -d --build');

      try {
        console.log(`   waiting for :${example.port}...`);
        await waitForReady(example.port);
        await screenshotExample(example, browser);
      } finally {
        compose(example.composeDir, 'down -v');
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\n✅ All screenshots captured.');
  console.log(`   Location: examples/screenshots/`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
