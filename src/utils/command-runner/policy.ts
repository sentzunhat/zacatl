import { realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

import { ValidationError } from '@zacatl/error';

import type { CommandSpec, RunnerPolicy } from './types';

/** Shell metacharacters that must never appear inside an argument. */
const SUSPICIOUS_CHARS_RE = /[;&|`$<>!\\]/;

const isPathContained = (allowedRoot: string, candidate: string): boolean => {
  const relativePath = relative(allowedRoot, candidate);
  return (
    relativePath === '' ||
    (relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath))
  );
};

/**
 * Validates a `CommandSpec` against the active `RunnerPolicy`.
 *
 * Run this before spawning to enforce security invariants at the boundary
 * between untrusted input (AI tool calls, CLI input) and the OS.
 *
 * @param spec   - The command to validate
 * @param policy - Active runner policy with allowlist / deny rules
 *
 * @throws ValidationError when no allowlist is configured
 * @throws ValidationError when `cmd` is not in the allowlist
 * @throws ValidationError when any argument matches a deny pattern
 * @throws ValidationError when any argument contains a shell metacharacter
 * @throws ValidationError when `cwd` violates the `cwdPrefix` restriction
 *
 * @example
 * ```typescript
 * const policy = RunnerPolicySchema.parse({ allowlist: ['npm', 'node'] });
 * validateCommandSpec({ cmd: 'npm', args: ['run', 'build'] }, policy); // ok
 * validateCommandSpec({ cmd: 'rm', args: ['-rf', '/'] }, policy); // throws
 * ```
 */
export const validateCommandSpec = (spec: CommandSpec, policy: RunnerPolicy): void => {
  // 1. Allowlist check
  if (
    policy.allowUnrestrictedCommands !== true &&
    (!policy.allowlist || policy.allowlist.length === 0)
  ) {
    throw new ValidationError({
      message: 'Command execution requires a non-empty allowlist',
      component: 'CommandRunner',
      operation: 'validateCommandSpec',
      metadata: { cmd: spec.cmd },
    });
  }

  if (
    policy.allowUnrestrictedCommands !== true &&
    policy.allowlist?.includes(spec.cmd) !== true
  ) {
    throw new ValidationError({
      message: `Command "${spec.cmd}" is not in the allowlist`,
      component: 'CommandRunner',
      operation: 'validateCommandSpec',
      metadata: { cmd: spec.cmd, allowlist: policy.allowlist },
    });
  }

  // 2. Deny-pattern check against each argument
  if (policy.denyPatterns && policy.denyPatterns.length > 0) {
    for (const arg of spec.args) {
      for (const pattern of policy.denyPatterns) {
        if (new RegExp(pattern).test(arg)) {
          throw new ValidationError({
            message: `Argument "${arg}" matches deny pattern "${pattern}"`,
            component: 'CommandRunner',
            operation: 'validateCommandSpec',
            metadata: { arg, pattern },
          });
        }
      }
    }
  }

  // 3. Suspicious shell-metacharacter check
  for (const arg of spec.args) {
    if (SUSPICIOUS_CHARS_RE.test(arg)) {
      throw new ValidationError({
        message: `Argument "${arg}" contains a suspicious character`,
        component: 'CommandRunner',
        operation: 'validateCommandSpec',
        metadata: { arg },
      });
    }
  }

  // 4. Canonical working-directory containment
  if (policy.cwdPrefix !== undefined && spec.cwd !== undefined) {
    let allowedRoot: string;
    let candidate: string;

    try {
      allowedRoot = realpathSync(resolve(policy.cwdPrefix));
      candidate = realpathSync(resolve(spec.cwd));
    } catch (error) {
      throw new ValidationError({
        message: 'Working directory containment could not be verified',
        component: 'CommandRunner',
        operation: 'validateCommandSpec',
        metadata: {
          cwd: spec.cwd,
          cwdPrefix: policy.cwdPrefix,
          reason: error instanceof Error ? error.message : String(error),
        },
      });
    }

    if (!isPathContained(allowedRoot, candidate)) {
      throw new ValidationError({
        message: `Working directory "${spec.cwd}" is outside the allowed root "${policy.cwdPrefix}"`,
        component: 'CommandRunner',
        operation: 'validateCommandSpec',
        metadata: { cwd: spec.cwd, cwdPrefix: policy.cwdPrefix },
      });
    }
  }
};
