import { spawn } from 'child_process';

import type { CommandSpec, CommandResult, RunnerPolicy } from './types';

/** Grace period between SIGTERM and SIGKILL when a timeout fires. */
const SIGKILL_GRACE_MS = 2000;

/**
 * Executes a single shell-free command via `child_process.spawn` (scripts-only).
 *
 * Simplified version designed for build scripts that cannot depend on src/.
 * For production code, use `runCommand` from `src/utils/command-runner`.
 *
 * Guarantees (in order):
 * 1. Hard timeout: SIGTERM → SIGKILL after `SIGKILL_GRACE_MS` grace period
 * 2. Output capped at `policy.maxOutputBytes` (combined stdout + stderr)
 * 3. Timing measurement and structured result
 *
 * The returned promise always **resolves** — it never rejects.
 *
 * @param spec - Structured command to execute
 * @param policy - Runner policy with timeout and output limits
 * @returns - Structured `CommandResult` with exit code, output, and timing
 *
 * @example
 * ```typescript
 * const policy = { timeoutMs: 30000, maxOutputBytes: 1048576, maxConcurrency: 4, inheritEnv: true };
 * const result = await runCommand({ cmd: 'node', args: ['--version'] }, policy);
 * console.log(result.stdout); // v24.x.x
 * ```
 */
export const runCommand = (spec: CommandSpec, policy: RunnerPolicy): Promise<CommandResult> => {
  return new Promise<CommandResult>((resolve) => {
    const startMs = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let outputBytes = 0;

    const env: NodeJS.ProcessEnv = policy.inheritEnv
      ? ({ ...process.env, ...(spec.env ?? {}) } as NodeJS.ProcessEnv)
      : ({ ...(spec.env ?? {}) } as NodeJS.ProcessEnv);

    const child = spawn(spec.cmd, spec.args, {
      shell: false,
      cwd: spec.cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // — Timeout enforcement
    const killTimer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      // Escalate to SIGKILL if the process ignores SIGTERM
      const forceKill = setTimeout(() => {
        child.kill('SIGKILL');
      }, SIGKILL_GRACE_MS);
      // Keep the event loop from staying alive just for this timer
      if (typeof forceKill.unref === 'function') forceKill.unref();
    }, policy.timeoutMs);

    // — Output collection (capped at maxOutputBytes)
    child.stdout?.on('data', (chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes <= policy.maxOutputBytes) {
        stdout += chunk.toString('utf-8');
      }
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes <= policy.maxOutputBytes) {
        stderr += chunk.toString('utf-8');
      }
    });

    // — Normal exit
    child.on('close', (code) => {
      clearTimeout(killTimer);
      resolve({
        cmd: spec.cmd,
        args: spec.args,
        exitCode: code ?? null,
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
        cmd: spec.cmd,
        args: spec.args,
        exitCode: null,
        stdout,
        stderr: stderr ? `${stderr}\n${err.message}` : err.message,
        timedOut,
        durationMs: Date.now() - startMs,
      });
    });
  });
};
