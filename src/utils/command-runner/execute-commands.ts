import { runCommand } from './runner';
import { runnerPolicySchema } from './types';
import type { CommandSpec, CommandResult, RunnerPolicy } from './types';

/**
 * Executes a batch of `CommandSpec` entries in parallel, bounded by
 * `policy.maxConcurrency`.
 *
 * Commands are dispatched FIFO; results are returned in the same order as
 * the input array regardless of completion order. Passing an empty array
 * short-circuits immediately and returns `[]`.
 *
 * Policy defaults are applied via `RunnerPolicySchema`, so an empty object
 * `{}` is a valid policy that uses all safe defaults.
 *
 * @param commands    - Ordered list of commands to run
 * @param policyInput - Partial policy; omitted fields receive safe defaults
 * @returns           - Ordered `CommandResult[]` aligned with the input array
 *
 * @throws ZodError       when any `CommandSpec` fails schema validation
 * @throws ValidationError when any `CommandSpec` violates the active policy
 *
 * @example
 * ```typescript
 * const results = await executeCommands(
 *   [
 *     { cmd: 'npm', args: ['run', 'build'] },
 *     { cmd: 'npm', args: ['test'] },
 *   ],
 *   { maxConcurrency: 2, inheritEnv: true },
 * );
 * ```
 */
export const executeCommands = (
  commands: CommandSpec[],
  policyInput: Partial<RunnerPolicy> = {},
): Promise<CommandResult[]> => {
  const policy = runnerPolicySchema.parse(policyInput);

  if (commands.length === 0) {
    return Promise.resolve([]);
  }

  return new Promise<CommandResult[]>((resolve, reject) => {
    const results: CommandResult[] = new Array(commands.length);
    let nextIndex = 0;
    let active = 0;

    const dispatch = (): void => {
      while (active < policy.maxConcurrency && nextIndex < commands.length) {
        const capturedIndex = nextIndex++;
        active++;

        runCommand(commands[capturedIndex]!, policy)
          .then((result) => {
            results[capturedIndex] = result;
          })
          .catch(reject)
          .finally(() => {
            active--;

            if (nextIndex < commands.length) {
              dispatch();
            } else if (active === 0) {
              resolve(results);
            }
          });
      }
    };

    dispatch();
  });
};
