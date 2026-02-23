import 'reflect-metadata';

import {
  mongoTeardown,
  startMongoServerAndSetEnvConnectionString,
} from '../helpers/database/mongo';
import { logger } from '../helpers/common/logger';
import { execSync } from 'child_process';
import { globSync } from 'glob';

/**
 * @remarks
 * https://vitest.dev/config/#globalsetup
 */

const formatMemoryUsage = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const getTypeScriptVersion = (): string => {
  try {
    return execSync('npx tsc --version', { encoding: 'utf-8' }).trim().replace('Version ', '');
  } catch {
    return 'unknown';
  }
};

const getTestFileCount = (): number => {
  try {
    return globSync('test/**/*.test.ts').length;
  } catch {
    return 0;
  }
};

export const setup = async (): Promise<void> => {
  logger.log({
    level: 'info',
    action: 'setup',
    msg: 'starting',
  });

  const start = performance.now();
  const memoryBefore = process.memoryUsage();

  // Runtime information
  logger.log({
    level: 'info',
    action: 'setup',
    msg: `runtime: ${process.release?.name || 'node'} ${process.version}`,
  });
  logger.log({
    level: 'info',
    action: 'setup',
    msg: `typescript: ${getTypeScriptVersion()}`,
  });
  logger.log({
    level: 'info',
    action: 'setup',
    msg: `environment: NODE_ENV=${process.env['NODE_ENV'] || 'unknown'}, ENV=${
      process.env['ENV'] || 'unknown'
    }`,
  });
  logger.log({
    level: 'info',
    action: 'setup',
    msg: `test files: ${getTestFileCount()}`,
  });

  // Memory usage before
  logger.log({
    level: 'info',
    action: 'setup',
    msg: `heapTotal memory usage before: ${formatMemoryUsage(memoryBefore.heapTotal)}`,
  });
  logger.log({
    level: 'info',
    action: 'setup',
    msg: `heapUsed memory usage before: ${formatMemoryUsage(memoryBefore.heapUsed)}`,
  });

  await startMongoServerAndSetEnvConnectionString();

  const end = performance.now();

  logger.log({
    level: 'info',
    action: 'setup',
    msg: `completed in ${(end - start).toFixed(2)} ms - ⏱️`,
  });

  // Capture initial memory for delta calculation in teardown
  initialMemory = process.memoryUsage();
};

// Store initial memory for comparison
let initialMemory: { heapTotal: number; heapUsed: number } = {
  heapTotal: 0,
  heapUsed: 0,
};

export const teardown = async (): Promise<void> => {
  logger.log({
    level: 'info',
    action: 'teardown',
    msg: 'starting',
  });

  const start = performance.now();
  const memoryAfter = process.memoryUsage();

  // Memory usage after
  logger.log({
    level: 'info',
    action: 'teardown',
    msg: `heapTotal memory usage after: ${formatMemoryUsage(memoryAfter.heapTotal)}`,
  });
  logger.log({
    level: 'info',
    action: 'teardown',
    msg: `heapUsed memory usage after: ${formatMemoryUsage(memoryAfter.heapUsed)}`,
  });

  // Memory delta and percentage
  if (initialMemory.heapTotal > 0) {
    const heapTotalDelta = memoryAfter.heapTotal - initialMemory.heapTotal;
    const heapUsedDelta = memoryAfter.heapUsed - initialMemory.heapUsed;
    const heapUsagePercent = ((memoryAfter.heapUsed / memoryAfter.heapTotal) * 100).toFixed(2);

    logger.log({
      level: 'info',
      action: 'teardown',
      msg: `memory delta: heapTotal ${heapTotalDelta >= 0 ? '+' : ''}${formatMemoryUsage(
        heapTotalDelta,
      )}, heapUsed ${heapUsedDelta >= 0 ? '+' : ''}${formatMemoryUsage(heapUsedDelta)}`,
    });
    logger.log({
      level: 'info',
      action: 'teardown',
      msg: `heap usage: ${heapUsagePercent}%`,
    });
  }

  await mongoTeardown();

  const end = performance.now();
  logger.log({
    level: 'info',
    action: 'teardown',
    msg: `completed in ${(end - start).toFixed(2)} ms - ⏱️`,
  });
};
