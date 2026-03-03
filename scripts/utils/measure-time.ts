import { performance } from 'perf_hooks';

export interface MeasureTimeOptions {
  name: string;
  fn: () => Promise<void> | void;
  silent?: boolean;
}

/**
 * Measures and logs the execution time of a function (scripts-only utility).
 *
 * This is a standalone version designed for build scripts that cannot depend on src/.
 * For production code, use `measureExecutionTime` from `src/utils/measure-execution-time`.
 *
 * Outputs timing to console with formatting:
 * - `[name] Started` — before execution
 * - `[name] Completed in Xms` — for operations < 1 second
 * - `[name] Completed in X.XXXs (Xms)` — for operations >= 1 second
 *
 * @param options - Configuration options for measurement
 * @param options.name - The name of the process being measured
 * @param options.fn - The async or sync function to execute and measure
 * @param options.silent - When true, suppresses all console output (default: false)
 *
 * @example
 * ```typescript
 * // Measure an async operation with timing output
 * await measureTime({
 *   name: 'build-step',
 *   fn: async () => {
 *     await compileAssets();
 *   }
 * });
 * // Output:
 * // [build-step] Started
 * // [build-step] Completed in 1234.56ms
 * ```
 *
 * @example
 * ```typescript
 * // Silent execution (no logs)
 * await measureTime({
 *   name: 'background-task',
 *   fn: async () => {
 *     await processQueue();
 *   },
 *   silent: true
 * });
 * ```
 */
export const measureTime = async ({
  name,
  fn,
  silent = false,
}: MeasureTimeOptions): Promise<void> => {
  if (!silent) {
    // eslint-disable-next-line no-console
    console.log(`[${name}] Started`);
  }

  const startTime = performance.now();

  await fn();

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  if (!silent) {
    const durationInSeconds = (Number(duration) / 1000).toFixed(3);

    if (Number(duration) >= 1000) {
      // eslint-disable-next-line no-console
      console.log(`[${name}] Completed in ${durationInSeconds}s (${duration}ms)`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`[${name}] Completed in ${duration}ms`);
    }
  }
};
