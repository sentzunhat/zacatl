#!/usr/bin/env node
/**
 * parallel-runner.ts
 *
 * Runs multiple commands in parallel using the command-runner module.
 *
 * Usage:
 *   npm run parallel -- "<cmd1>,<cmd2>,..."
 *   npm run parallel -- "<cmd1>,<cmd2>,..." --concurrency=<n> --timeout=<ms>
 *
 * Examples:
 *   npm run parallel -- "npm run build:src:cjs,npm run build:src:esm"
 *   npm run parallel -- "npm run lint:src,npm run lint:test,npm run type:check" --concurrency=3
 *   npm run parallel -- "echo hello,echo world,node --version" --timeout=5000
 *
 * Each command entry is a whitespace-separated string where the first token is
 * the binary and the remaining tokens are its arguments. Entries are
 * comma-separated with no shell expansion — safe for AI-generated input.
 *
 * Flags (all optional):
 *   --concurrency=<n>   Max parallel commands (default: number of commands)
 *   --timeout=<ms>      Per-command timeout in milliseconds (default: 120 000)
 */

import { executeCommands } from '../../src/utils/command-runner/index.js';
import type { CommandSpec, RunnerPolicy } from '../../src/utils/command-runner/index.js';

const USAGE = [
  'Usage:',
  '  npm run parallel -- "npm run build:src:cjs,npm run build:src:esm"',
  '  npm run parallel -- "<cmd1>,<cmd2>,..." --concurrency=3 --timeout=60000',
].join('\n');

/**
 * Parses a raw command string such as `"npm run build:src:cjs"` into a
 * `CommandSpec` by splitting on whitespace.
 *
 * @param raw - Single command string (no commas; split before calling this)
 * @returns   - CommandSpec with `cmd` and `args` separated
 */
const parseCommandSpec = (raw: string): CommandSpec => {
  const tokens = raw.trim().split(/\s+/);
  const cmd = tokens[0];
  if (!cmd) {
    throw new Error(`Empty command in spec: "${raw}"`);
  }
  return { cmd, args: tokens.slice(1) };
};

/**
 * Extracts the value of a `--key=value` or `--key value` flag from argv.
 *
 * @param argv  - Raw process.argv slice
 * @param flag  - Flag name without leading `--` (e.g. `'concurrency'`)
 * @returns     - String value, or `undefined` when the flag is absent
 */
const getFlag = (argv: string[], flag: string): string | undefined => {
  const prefix = `--${flag}=`;
  const inline = argv.find((a) => a.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const idx = argv.indexOf(`--${flag}`);
  if (idx !== -1 && idx + 1 < argv.length) return argv[idx + 1];

  return undefined;
};

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);

  // Positional: first non-flag argument is the comma-separated command string.
  const commandsArg = argv.find((a) => !a.startsWith('--'));

  if (!commandsArg) {
    console.error('Error: no commands provided.\n');
    console.error(USAGE);
    process.exit(1);
  }

  const specs: CommandSpec[] = commandsArg
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(parseCommandSpec);

  if (specs.length === 0) {
    console.error('Error: command list is empty after parsing.\n');
    console.error(USAGE);
    process.exit(1);
  }

  const concurrencyFlag = getFlag(argv, 'concurrency');
  const timeoutFlag = getFlag(argv, 'timeout');

  const policy: Partial<RunnerPolicy> = {
    maxConcurrency: concurrencyFlag ? parseInt(concurrencyFlag, 10) : specs.length,
    timeoutMs: timeoutFlag ? parseInt(timeoutFlag, 10) : 120_000,
    maxOutputBytes: 2_097_152,
    inheritEnv: true,
  };

  console.log(
    `\n  parallel-runner — ${specs.length} command(s), concurrency ${policy.maxConcurrency}\n`,
  );
  for (const s of specs) {
    console.log(`    > ${[s.cmd, ...s.args].join(' ')}`);
  }
  console.log();

  const startMs = Date.now();
  const results = await executeCommands(specs, policy);
  const totalMs = Date.now() - startMs;

  let failures = 0;

  for (const result of results) {
    const label = [result.cmd, ...result.args].join(' ');
    const status = result.timedOut
      ? 'TIMEOUT'
      : result.exitCode === 0
      ? 'OK'
      : `EXIT(${result.exitCode ?? 'null'})`;

    if (result.exitCode !== 0 || result.timedOut) failures++;

    console.log(`  [${status.padEnd(10)}] ${String(result.durationMs).padStart(6)} ms  ${label}`);

    if (result.stdout.trim()) {
      const lines = result.stdout.trim().split('\n');
      for (const line of lines) {
        console.log(`               out: ${line}`);
      }
    }
    if (result.stderr.trim()) {
      const lines = result.stderr.trim().split('\n');
      for (const line of lines) {
        console.error(`               err: ${line}`);
      }
    }
  }

  console.log(`\n  wall-clock: ${totalMs} ms  |  failures: ${failures} / ${results.length}\n`);

  process.exit(failures > 0 ? 1 : 0);
};

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
