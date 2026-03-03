/**
 * Structured command specification and result types (scripts-only).
 *
 * Simplified versions designed for build scripts that cannot depend on src/.
 * For production code, use types from `src/utils/command-runner`.
 */

export interface CommandSpec {
  cmd: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
}

export interface CommandResult {
  cmd: string;
  args: string[];
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
}

export interface RunnerPolicy {
  timeoutMs: number;
  maxOutputBytes: number;
  maxConcurrency: number;
  inheritEnv: boolean;
}

/** Default safe values for RunnerPolicy */
export const DEFAULT_RUNNER_POLICY: RunnerPolicy = {
  timeoutMs: 30_000,
  maxOutputBytes: 1_048_576,
  maxConcurrency: 4,
  inheritEnv: false,
};

/**
 * Applies defaults to a partial policy object.
 * @param input - Partial policy with some or all fields
 * @returns - Full RunnerPolicy with defaults applied
 */
export const applyPolicyDefaults = (input: Partial<RunnerPolicy>): RunnerPolicy => ({
  timeoutMs: input.timeoutMs ?? DEFAULT_RUNNER_POLICY.timeoutMs,
  maxOutputBytes: input.maxOutputBytes ?? DEFAULT_RUNNER_POLICY.maxOutputBytes,
  maxConcurrency: input.maxConcurrency ?? DEFAULT_RUNNER_POLICY.maxConcurrency,
  inheritEnv: input.inheritEnv ?? DEFAULT_RUNNER_POLICY.inheritEnv,
});
