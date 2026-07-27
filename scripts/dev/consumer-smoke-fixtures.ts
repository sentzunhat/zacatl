#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

interface Fixture {
  name: string;
  description: string;
  dependencies: Record<string, string>;
  expectedAuditClean: boolean;
  forbiddenInstalledPackages?: string[];
  source: string;
}

interface CommandResult {
  ok: boolean;
  output: string;
}

interface RunOptions {
  disableImplicitAudit?: boolean;
}

const root = process.cwd();
const publishDir = path.join(root, 'publish');

const fixtures: Fixture[] = [
  {
    name: 'non-sql',
    description: 'Zacatl core consumer with no database peers',
    dependencies: {},
    expectedAuditClean: true,
    forbiddenInstalledPackages: ['sequelize', 'sqlite3'],
    source: `
      import { DatabaseVendor, ServiceType } from '@sentzunhat/zacatl/service';

      const proof = {
        serviceType: ServiceType.SERVER,
        sqliteVendor: DatabaseVendor.SQLITE,
      };

      console.log(JSON.stringify(proof));
    `,
  },
  {
    name: 'node-sqlite',
    description: 'Node 26 built-in SQLite consumer with no sequelize/sqlite3 peer',
    dependencies: {},
    expectedAuditClean: true,
    forbiddenInstalledPackages: ['sequelize', 'sqlite3'],
    source: `
      import { DatabaseSync } from 'node:sqlite';

      import { DatabaseVendor } from '@sentzunhat/zacatl/service';
      import type { DatabaseSync as ZacatlDatabaseSync } from '@sentzunhat/zacatl/third-party/databases/nodesqlite';

      const db: ZacatlDatabaseSync = new DatabaseSync(':memory:');
      db.exec('CREATE TABLE items (id TEXT PRIMARY KEY, value TEXT NOT NULL)');
      db.prepare('INSERT INTO items (id, value) VALUES (?, ?)').run('one', 'ok');
      const row = db.prepare('SELECT value FROM items WHERE id = ?').get('one') as { value: string };
      db.close();

      console.log(JSON.stringify({ vendor: DatabaseVendor.SQLITE, value: row.value }));
    `,
  },
  {
    name: 'mongoose',
    description: 'Mongoose/MongoDB consumer with explicit optional peers',
    dependencies: {
      mongodb: '^7.2.0',
      mongoose: '^9.7.4',
    },
    expectedAuditClean: true,
    source: `
      import { Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';

      const schema = new Schema({ message: { type: String, required: true } });
      console.log(JSON.stringify({ paths: Object.keys(schema.paths).sort() }));
    `,
  },
  {
    name: 'sequelize-sqlite',
    description: 'Sequelize SQLite consumer with explicit sequelize/sqlite3 peers',
    dependencies: {
      sequelize: '^6.37.8',
      sqlite3: '^6.0.1',
    },
    expectedAuditClean: false,
    source: `
      import sqlite3 from '@sentzunhat/zacatl/third-party/databases/sqlite3';
      import { DataTypes, Sequelize, type SequelizeOptions } from '@sentzunhat/zacatl/third-party/databases/sequelize';

      const sequelize = new Sequelize({
        dialect: 'sqlite',
        dialectModule: sqlite3 as SequelizeOptions['dialectModule'],
        logging: false,
        storage: ':memory:',
      });

      const attributes = {
        id: { type: DataTypes.STRING, primaryKey: true },
        message: { type: DataTypes.STRING, allowNull: false },
      };

      await sequelize.close();
      console.log(JSON.stringify({ dialect: 'sqlite', fields: Object.keys(attributes) }));
    `,
  },
  {
    name: 'sequelize-postgres',
    description: 'Sequelize Postgres consumer with explicit sequelize/pg peers',
    dependencies: {
      pg: '^8.22.0',
      sequelize: '^6.37.8',
    },
    expectedAuditClean: false,
    source: `
      import { Sequelize } from '@sentzunhat/zacatl/third-party/databases/sequelize';

      const sequelize = new Sequelize('postgres://user:password@localhost:5432/example', {
        dialect: 'postgres',
        logging: false,
      });

      await sequelize.close();
      console.log(JSON.stringify({ dialect: sequelize.getDialect() }));
    `,
  },
];

const usage = [
  'Usage: npm run smoke:consumers -- [--fixture=name] [--keep]',
  '',
  'Runs packed-package consumer smoke fixtures against ./publish.',
  'Build first with: npm run build && npm run prepare-publish',
].join('\n');

const args = process.argv.slice(2);
const keepScratch = args.includes('--keep');
const fixtureArg = args.find((arg) => arg.startsWith('--fixture='));
const selectedFixture = fixtureArg?.slice('--fixture='.length);

if (args.includes('--help')) {
  console.log(usage);
  process.exit(0);
}

const activeFixtures =
  selectedFixture == null
    ? fixtures
    : fixtures.filter((fixture) => fixture.name === selectedFixture);

if (activeFixtures.length === 0) {
  console.error(`Unknown fixture: ${selectedFixture ?? ''}`);
  console.error(`Available fixtures: ${fixtures.map((fixture) => fixture.name).join(', ')}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(publishDir, 'package.json'))) {
  console.error('Missing publish/package.json.');
  console.error('Run `npm run build && npm run prepare-publish` before consumer smokes.');
  process.exit(1);
}

const run = (cmd: string, args: string[], cwd: string, options: RunOptions = {}): CommandResult => {
  try {
    const output = execFileSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        npm_config_fund: 'false',
        ...(options.disableImplicitAudit === true ? { npm_config_audit: 'false' } : {}),
      },
    });
    return { ok: true, output };
  } catch (error: unknown) {
    const err = error as { stdout?: Buffer | string; stderr?: Buffer | string };
    const stdout = Buffer.isBuffer(err.stdout) ? err.stdout.toString('utf8') : (err.stdout ?? '');
    const stderr = Buffer.isBuffer(err.stderr) ? err.stderr.toString('utf8') : (err.stderr ?? '');
    return { ok: false, output: `${stdout}${stderr}` };
  }
};

const writeJson = (file: string, value: unknown): void => {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const normalizeSource = (source: string): string =>
  `${source
    .split('\n')
    .map((line) => line.replace(/^ {6}/, ''))
    .join('\n')
    .trim()}\n`;

const scratchRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-consumer-smoke-'));
let failures = 0;

console.log(`consumer-smoke: scratch ${scratchRoot}`);

try {
  const pack = run('npm', ['pack', publishDir, '--pack-destination', scratchRoot, '--json'], root);
  if (!pack.ok) {
    console.error(pack.output);
    process.exit(1);
  }

  const packResult = JSON.parse(pack.output) as Array<{ filename: string }>;
  const tarballName = packResult[0]?.filename;
  if (tarballName == null) {
    console.error(`Could not read tarball name from npm pack output: ${pack.output}`);
    process.exit(1);
  }

  const tarballPath = path.join(scratchRoot, tarballName);

  for (const fixture of activeFixtures) {
    const fixtureDir = path.join(scratchRoot, fixture.name);
    const srcDir = path.join(fixtureDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    writeJson(path.join(fixtureDir, 'package.json'), {
      name: `zacatl-consumer-${fixture.name}`,
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        build: 'tsc -p tsconfig.json',
        start: 'node dist/index.js',
      },
      dependencies: {
        '@sentzunhat/zacatl': tarballPath,
        ...fixture.dependencies,
      },
      devDependencies: {
        '@types/node': '^26.1.1',
        typescript: '^6.0.3',
      },
    });

    writeJson(path.join(fixtureDir, 'tsconfig.json'), {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        lib: ['ES2022'],
        types: ['node'],
        outDir: 'dist',
        rootDir: 'src',
        strict: true,
        skipLibCheck: true,
        ignoreDeprecations: '6.0',
      },
      include: ['src/**/*'],
    });

    fs.writeFileSync(path.join(srcDir, 'index.ts'), normalizeSource(fixture.source));

    console.log(`\n[${fixture.name}] ${fixture.description}`);

    const install = run('npm', ['install'], fixtureDir, { disableImplicitAudit: true });
    if (!install.ok) {
      failures++;
      console.error(`[${fixture.name}] install failed`);
      console.error(install.output);
      continue;
    }
    console.log(`[${fixture.name}] install ok`);

    const forbiddenInstalled = findForbiddenInstalledPackages(
      path.join(fixtureDir, 'package-lock.json'),
      fixture.forbiddenInstalledPackages ?? [],
    );
    if (forbiddenInstalled.length > 0) {
      failures++;
      console.error(
        `[${fixture.name}] forbidden packages installed: ${forbiddenInstalled.join(', ')}`,
      );
      continue;
    }
    if ((fixture.forbiddenInstalledPackages ?? []).length > 0) {
      console.log(`[${fixture.name}] forbidden package check ok`);
    }

    const build = run('npm', ['run', 'build'], fixtureDir);
    if (!build.ok) {
      failures++;
      console.error(`[${fixture.name}] build failed`);
      console.error(build.output);
      continue;
    }
    console.log(`[${fixture.name}] build ok`);

    const start = run('npm', ['run', 'start'], fixtureDir);
    if (!start.ok) {
      failures++;
      console.error(`[${fixture.name}] runtime import failed`);
      console.error(start.output);
      continue;
    }
    console.log(`[${fixture.name}] runtime ok ${start.output.trim()}`);

    const audit = run('npm', ['audit', '--omit=dev'], fixtureDir);
    if (audit.ok) {
      console.log(`[${fixture.name}] audit ok`);
    } else if (fixture.expectedAuditClean) {
      failures++;
      console.error(`[${fixture.name}] audit failed unexpectedly`);
      console.error(audit.output);
    } else {
      console.log(`[${fixture.name}] audit completed with SQL-owned findings`);
      console.log(audit.output.trim());
    }
  }
} finally {
  if (keepScratch) {
    console.log(`\nconsumer-smoke: kept scratch ${scratchRoot}`);
  } else {
    fs.rmSync(scratchRoot, { recursive: true, force: true });
  }
}

if (failures > 0) {
  console.error(`\nconsumer-smoke: ${failures} fixture(s) failed`);
  process.exit(1);
}

console.log('\nconsumer-smoke: all required fixtures passed');

function findForbiddenInstalledPackages(lockfilePath: string, names: string[]): string[] {
  if (names.length === 0) return [];

  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8')) as {
    packages?: Record<string, unknown>;
  };
  const packages = Object.keys(lockfile.packages ?? {});

  return names.filter((name) =>
    packages.some((packagePath) => packagePath === `node_modules/${name}`),
  );
}
