import { performance } from 'perf_hooks';

import { logger } from '../logs';

export interface MeasureExecutionTimeOptions {
  name: string;
  fn: () => Promise<void>;
  silent?: boolean;
}

/**
 * Measures and logs the execution time of an async function
 * @param options - Configuration options for execution time measurement
 * @param options.name - The name of the process being measured
 * @param options.fn - The async function to execute and measure
 * @param options.silent - When true, suppresses all log output (default: false)
 *
 * @example
 * ```typescript
 * await measureExecutionTime({
 *   name: "data-import",
 *   fn: async () => {
 *     await importData();
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Silent execution (no logs)
 * await measureExecutionTime({
 *   name: "background-task",
 *   fn: async () => {
 *     await processQueue();
 *   },
 *   silent: true
 * });
 * ```
 */
export const measureExecutionTime = async ({
  name,
  fn,
  silent = false,
}: MeasureExecutionTimeOptions): Promise<void> => {
  if (!silent) {
    logger.info(`[${name}] Started`);
  }

  const startTime = performance.now();

  await fn();

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  if (!silent) {
    const durationInSeconds = (Number(duration) / 1000).toFixed(3);

    if (Number(duration) >= 1000) {
      logger.info(`[${name}] Completed in ${durationInSeconds}s (${duration}ms)`);
    } else {
      logger.info(`[${name}] Completed in ${duration}ms`);
    }
  }
};
