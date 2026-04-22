import { runCommand } from './runner';
import type { CommandSpec, CommandResult, RunnerPolicy } from './types';

/**
 * Executes a batch of `CommandSpec` entries in parallel, bounded by `policy.maxConcurrency`.
 * (scripts-only version)
 *
 * Simplified version designed for build scripts that cannot depend on src/.
 * For production code, use `executeCommands` from `src/utils/command-runner`.
 *
 * Commands are dispatched FIFO; results are returned in the same order as
 * the input array regardless of completion order. Passing an empty array
 * short-circuits immediately and returns `[]`.
 *
 * @param commands - Ordered list of commands to run
 * @param policy - Runner policy with concurrency and timeout limits
 * @returns - Ordered `CommandResult[]` aligned with the input array
 *
 * @example
 * ```typescript
 * const results = await executeCommands(
 *   [
 *     { cmd: 'npm', args: ['run', 'build'] },
 *     { cmd: 'npm', args: ['test'] },
 *   ],
 *   { maxConcurrency: 2, timeoutMs: 120000, maxOutputBytes: 2097152, inheritEnv: true },
 * );
 * ```
 */
export const executeCommands = (
  commands: CommandSpec[],
  policy: RunnerPolicy,
): Promise<CommandResult[]> => {
  if (commands.length === 0) {
    return Promise.resolve([]);
  }

  return new Promise<CommandResult[]>((resolve) => {
    const results: CommandResult[] = new Array(commands.length);
    let nextIndex = 0;
    let active = 0;

    const dispatch = (): void => {
      while (active < policy.maxConcurrency && nextIndex < commands.length) {
        const capturedIndex = nextIndex++;
        active++;

        // capturedIndex is always < commands.length (guarded by the while condition above)

        runCommand(commands[capturedIndex]!, policy)
          .then((result) => {
            results[capturedIndex] = result;
          })
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
