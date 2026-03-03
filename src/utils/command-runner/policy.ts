import { ValidationError } from '@zacatl/error';

import type { CommandSpec, RunnerPolicy } from './types';

/** Shell metacharacters that must never appear inside an argument. */
const SUSPICIOUS_CHARS_RE = /[;&|`$<>!\\]/;

/**
 * Validates a `CommandSpec` against the active `RunnerPolicy`.
 *
 * Run this before spawning to enforce security invariants at the boundary
 * between untrusted input (AI tool calls, CLI input) and the OS.
 *
 * @param spec   - The command to validate
 * @param policy - Active runner policy with allowlist / deny rules
 *
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
  if (policy.allowlist && policy.allowlist.length > 0) {
    if (!policy.allowlist.includes(spec.cmd)) {
      throw new ValidationError({
        message: `Command "${spec.cmd}" is not in the allowlist`,
        component: 'CommandRunner',
        operation: 'validateCommandSpec',
        metadata: { cmd: spec.cmd, allowlist: policy.allowlist },
      });
    }
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

  // 4. Working-directory prefix restriction
  if (policy.cwdPrefix !== undefined && spec.cwd !== undefined) {
    if (!spec.cwd.startsWith(policy.cwdPrefix)) {
      throw new ValidationError({
        message: `Working directory "${spec.cwd}" is outside the allowed prefix "${policy.cwdPrefix}"`,
        component: 'CommandRunner',
        operation: 'validateCommandSpec',
        metadata: { cwd: spec.cwd, cwdPrefix: policy.cwdPrefix },
      });
    }
  }
};
