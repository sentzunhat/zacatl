import { performance } from 'perf_hooks';

import { logger } from '../logs';

const measureExecutionTime = async (
  processName: string,
  callback: () => Promise<void>,
  skipOutput = false,
): Promise<void> => {
  if (!skipOutput) {
    logger.info(`${processName} execution started`);
  }

  const startTime = performance.now();

  await callback();

  const endTime = performance.now();

  const duration = (endTime - startTime).toFixed(2);

  if (!skipOutput) {
    logger.info(`${processName} execution time: ${duration} ms`);
  }
};

export { measureExecutionTime };
