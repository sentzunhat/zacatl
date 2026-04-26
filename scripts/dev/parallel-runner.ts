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

import { applyPolicyDefaults, executeCommands } from '../utils/index.js';
import { measureTime } from '../utils/index.js';
import type { CommandSpec } from '../utils/index.js';

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
  if (cmd === undefined || cmd.length === 0) {
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
  if (inline !== undefined) return inline.slice(prefix.length);

  const idx = argv.indexOf(`--${flag}`);
  if (idx !== -1 && idx + 1 < argv.length) return argv[idx + 1];

  return undefined;
};

const main = async (): Promise<number> => {
  let exitCode = 0;

  await measureTime({
    name: 'parallel-runner',
    fn: async () => {
      const argv = process.argv.slice(2);

      // Positional: first non-flag argument is the comma-separated command string.
      const commandsArg = argv.find((a) => !a.startsWith('--'));

      if (commandsArg === undefined) {
        // eslint-disable-next-line no-console
        console.error('Error: no commands provided.\n');
        // eslint-disable-next-line no-console
        console.error(USAGE);
        exitCode = 1;
        return;
      }

      const specs: CommandSpec[] = commandsArg
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map(parseCommandSpec);

      if (specs.length === 0) {
        // eslint-disable-next-line no-console
        console.error('Error: command list is empty after parsing.\n');
        // eslint-disable-next-line no-console
        console.error(USAGE);
        exitCode = 1;
        return;
      }

      const concurrencyFlag = getFlag(argv, 'concurrency');
      const timeoutFlag = getFlag(argv, 'timeout');

      const policy = applyPolicyDefaults({
        maxConcurrency:
          concurrencyFlag !== undefined ? parseInt(concurrencyFlag, 10) : specs.length,
        timeoutMs: timeoutFlag !== undefined ? parseInt(timeoutFlag, 10) : 120_000,
        maxOutputBytes: 2_097_152,
        inheritEnv: true,
      });

      // eslint-disable-next-line no-console
      console.log(
        `\n  parallel-runner — ${specs.length} command(s), concurrency ${policy.maxConcurrency}\n`,
      );
      for (const s of specs) {
        // eslint-disable-next-line no-console
        console.log(`    > ${[s.cmd, ...s.args].join(' ')}`);
      }
      // eslint-disable-next-line no-console
      console.log();

      const results = await executeCommands(specs, policy);

      let failures = 0;

      for (const result of results) {
        const label = [result.cmd, ...result.args].join(' ');
        const status = result.timedOut
          ? 'TIMEOUT'
          : result.exitCode === 0
          ? 'OK'
          : `EXIT(${result.exitCode ?? 'null'})`;

        if (result.exitCode !== 0 || result.timedOut) failures++;

        // eslint-disable-next-line no-console
        console.log(
          `  [${status.padEnd(10)}] ${String(result.durationMs).padStart(6)} ms  ${label}`,
        );

        const stdout = result.stdout.trim();
        if (stdout.length > 0) {
          const lines = stdout.split('\n');
          for (const line of lines) {
            // eslint-disable-next-line no-console
            console.log(`               out: ${line}`);
          }
        }
        const stderr = result.stderr.trim();
        if (stderr.length > 0) {
          const lines = stderr.split('\n');
          for (const line of lines) {
            // eslint-disable-next-line no-console
            console.error(`               err: ${line}`);
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log(`\n  failures: ${failures} / ${results.length}\n`);

      exitCode = failures > 0 ? 1 : 0;
    },
  });

  process.exit(exitCode);
};

void main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
