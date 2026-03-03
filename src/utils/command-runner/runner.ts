import { spawn } from 'child_process';

import { validateCommandSpec } from './policy';
import { commandSpecSchema } from './types';
import type { CommandSpec, CommandResult, RunnerPolicy } from './types';

/** Grace period between SIGTERM and SIGKILL when a timeout fires. */
const SIGKILL_GRACE_MS = 2_000;

/**
 * Executes a single shell-free command via `child_process.spawn`.
 *
 * Guarantees (in order):
 * 1. Zod schema validation on `spec`
 * 2. Policy validation — allowlist, deny patterns, cwd prefix, metacharacters
 * 3. Hard timeout: SIGTERM → SIGKILL after `SIGKILL_GRACE_MS` grace period
 * 4. Output capped at `policy.maxOutputBytes` (combined stdout + stderr)
 *
 * The returned promise always **resolves** — it never rejects — so batch
 * callers retain full control over error aggregation strategy.
 * Validation failures (`ValidationError`, Zod errors) are the only case
 * where the promise rejects.
 *
 * @param spec   - Structured command to execute
 * @param policy - Parsed `RunnerPolicy` (use `RunnerPolicySchema.parse` first)
 * @returns      - Structured `CommandResult` with exit code, output, and timing
 *
 * @throws ZodError       when `spec` fails schema validation
 * @throws ValidationError when `spec` violates the active policy
 *
 * @example
 * ```typescript
 * const policy = RunnerPolicySchema.parse({ inheritEnv: true });
 * const result = await runCommand({ cmd: 'node', args: ['--version'] }, policy);
 * console.log(result.stdout); // v24.x.x
 * ```
 */
export const runCommand = (spec: CommandSpec, policy: RunnerPolicy): Promise<CommandResult> => {
  return new Promise<CommandResult>((resolve, reject) => {
    // — Structural validation (Zod)
    const parsed = commandSpecSchema.safeParse(spec);
    if (!parsed.success) {
      reject(parsed.error);
      return;
    }

    // — Policy validation
    try {
      validateCommandSpec(parsed.data, policy);
    } catch (err) {
      reject(err);
      return;
    }

    const startMs = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let outputBytes = 0;

    const env: NodeJS.ProcessEnv = policy.inheritEnv
      ? ({ ...process.env, ...(parsed.data.env ?? {}) } as NodeJS.ProcessEnv)
      : ({ ...(parsed.data.env ?? {}) } as NodeJS.ProcessEnv);

    const child = spawn(parsed.data.cmd, parsed.data.args, {
      shell: false,
      cwd: parsed.data.cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // — Timeout enforcement
    const killTimer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      // Escalate to SIGKILL if the process ignores SIGTERM
      const forceKill = setTimeout(() => child.kill('SIGKILL'), SIGKILL_GRACE_MS);
      // Keep the event loop from staying alive just for this timer
      if (typeof forceKill.unref === 'function') forceKill.unref();
    }, policy.timeoutMs);

    // — Output collection (capped at maxOutputBytes)
    child.stdout.on('data', (chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes <= policy.maxOutputBytes) {
        stdout += chunk.toString('utf-8');
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes <= policy.maxOutputBytes) {
        stderr += chunk.toString('utf-8');
      }
    });

    // — Normal exit
    child.on('close', (code) => {
      clearTimeout(killTimer);
      resolve({
        cmd: parsed.data.cmd,
        args: parsed.data.args,
        exitCode: code,
        stdout,
        stderr,
        timedOut,
        durationMs: Date.now() - startMs,
      });
    });

    // — Spawn / OS errors (e.g. ENOENT — binary not found)
    child.on('error', (err) => {
      clearTimeout(killTimer);
      resolve({
        cmd: parsed.data.cmd,
        args: parsed.data.args,
        exitCode: null,
        stdout,
        stderr: stderr ? `${stderr}\n${err.message}` : err.message,
        timedOut,
        durationMs: Date.now() - startMs,
      });
    });
  });
};
