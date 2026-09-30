/**
 * Verify every public entry point loads on its own without the optional
 * database peers.
 *
 * Each `package.json` export (ESM and CJS builds) is imported in a fresh Node
 * process — so one entry cannot mask another's missing setup, such as a
 * polyfill an earlier import installed — while the packages listed as optional
 * in `peerDependenciesMeta` are unresolvable, the way they are in a consumer
 * app that never installed them. Only `./third-party/databases/<peer>` may
 * fail, and only because its own peer is missing.
 *
 * Checks the prepared package in `publish/` (run after `npm run prepare-publish`),
 * which is the layout that ships to npm; pass another directory as the first
 * argument to check it instead.
 */
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { promisify } from 'util';

type ExportTarget = { import?: string; require?: string };
type Check = { subpath: string; format: 'esm' | 'cjs'; file: string; ownPeer?: string };

const execFileAsync = promisify(execFile);
const root = path.resolve(process.argv[2] ?? 'publish');

const hookModule = (peers: string[]): string =>
  `data:text/javascript,${encodeURIComponent(`
    import { registerHooks } from 'node:module';
    const peers = new Set(${JSON.stringify(peers)});
    registerHooks({
      resolve(specifier, context, nextResolve) {
        if (peers.has(specifier)) {
          throw new Error("Optional peer '" + specifier + "' is not installed (blocked)");
        }
        return nextResolve(specifier, context);
      },
    });
  `)}`;

const runCheck = async (check: Check, hook: string): Promise<string | null> => {
  const absolute = path.join(root, check.file);
  const args =
    check.format === 'esm'
      ? [
          '--import',
          hook,
          '--input-type=module',
          '-e',
          `await import(${JSON.stringify(pathToFileURL(absolute).href)});`,
        ]
      : ['--import', hook, '-e', `require(${JSON.stringify(absolute)});`];

  try {
    await execFileAsync(process.execPath, args, { cwd: root });
    return null;
  } catch (err: unknown) {
    const stderr = String((err as { stderr?: string }).stderr ?? err);
    if (check.ownPeer != null && stderr.includes(`Optional peer '${check.ownPeer}'`)) {
      return null;
    }
    const reason =
      stderr
        .split('\n')
        .find((line) => /^[A-Za-z]*Error\b/.test(line.trim()))
        ?.trim() ?? 'failed to load';
    return `${check.subpath} (${check.format}): ${reason}`;
  }
};

const main = async (): Promise<number> => {
  const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')) as {
    exports: Record<string, ExportTarget | string>;
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  };

  const optionalPeers = Object.entries(pkg.peerDependenciesMeta ?? {})
    .filter(([, meta]) => meta.optional === true)
    .map(([name]) => name);

  const checks: Check[] = [];
  for (const [subpath, target] of Object.entries(pkg.exports)) {
    if (typeof target === 'string') continue;
    const peer = /^\.\/third-party\/databases\/(.+)$/.exec(subpath)?.[1];
    const ownPeer = peer != null && optionalPeers.includes(peer) ? peer : undefined;
    if (target.import != null)
      checks.push({ subpath, format: 'esm', file: target.import, ownPeer });
    if (target.require != null)
      checks.push({ subpath, format: 'cjs', file: target.require, ownPeer });
  }

  const hook = hookModule(optionalPeers);
  const failures: string[] = [];
  const queue = [...checks];
  const workers = Array.from({ length: Math.max(1, os.availableParallelism() - 1) }, async () => {
    for (let check = queue.shift(); check != null; check = queue.shift()) {
      const failure = await runCheck(check, hook);
      if (failure != null) failures.push(failure);
    }
  });
  await Promise.all(workers);

  const peerList = optionalPeers.join(', ');
  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `${failures.length} entry point build(s) fail to load on their own without optional peers (${peerList}):\n  ` +
        failures.sort().join('\n  '),
    );
    return 1;
  }

  // eslint-disable-next-line no-console
  console.log(
    `All ${checks.length} entry point builds load on their own without optional peers (${peerList}).`,
  );
  return 0;
};

void main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
