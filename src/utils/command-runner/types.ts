import { z } from '@zacatl/third-party/zod';

/**
 * Structured, shell-free command specification.
 *
 * `cmd` is the binary name or absolute path. `args` is kept separate from
 * the command to eliminate shell injection — no string concatenation occurs.
 *
 * @example
 * ```typescript
 * const spec: CommandSpec = { cmd: 'npm', args: ['run', 'build'] };
 * ```
 */
export const commandSpecSchema = z.object({
  cmd: z.string().min(1, 'Command must not be empty'),
  args: z.array(z.string()).default([]),
  cwd: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
});

export type CommandSpec = z.infer<typeof commandSpecSchema>;

/**
 * Policy controls applied before and during each command execution.
 *
 * All fields are optional; safe defaults are applied by `RunnerPolicySchema`.
 *
 * @property timeoutMs      - Hard timeout per command in milliseconds (default 30 000)
 * @property maxOutputBytes - Combined stdout+stderr byte cap (default 1 048 576)
 * @property maxConcurrency - Max parallel commands in a batch (default 4)
 * @property allowlist      - When non-empty, only these `cmd` values are permitted
 * @property denyPatterns   - Regex strings; any matching argument is rejected
 * @property cwdPrefix      - All `cwd` values must start with this path prefix
 * @property inheritEnv     - Whether to inherit the parent process environment
 */
export const runnerPolicySchema = z.object({
  timeoutMs: z.number().int().positive().default(30_000),
  maxOutputBytes: z.number().int().positive().default(1_048_576),
  maxConcurrency: z.number().int().min(1).default(4),
  allowlist: z.array(z.string()).optional(),
  denyPatterns: z.array(z.string()).optional(),
  cwdPrefix: z.string().optional(),
  inheritEnv: z.boolean().default(false),
});

export type RunnerPolicy = z.infer<typeof runnerPolicySchema>;

/**
 * Structured result returned after a command finishes or times out.
 *
 * The promise returned by `runCommand` always resolves to this shape — it
 * never rejects — so batch callers retain full control over aggregation.
 */
export const commandResultSchema = z.object({
  cmd: z.string(),
  args: z.array(z.string()),
  exitCode: z.number().nullable(),
  stdout: z.string(),
  stderr: z.string(),
  timedOut: z.boolean(),
  durationMs: z.number(),
});

export type CommandResult = z.infer<typeof commandResultSchema>;
