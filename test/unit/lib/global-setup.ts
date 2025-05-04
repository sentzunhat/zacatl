import "reflect-metadata";

import {
  mongoTeardown,
  startMongoServerAndSetEnvConnectionString,
} from "../helpers/database/mongo";
import { logger } from "../helpers/common/logger";

/**
 * @remarks
 * https://vitest.dev/config/#globalsetup
 */

const formatMemoryUsage = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export const setup = async (): Promise<void> => {
  logger.log({
    level: "info",
    action: "setup",
    msg: "starting",
  });

  const start = performance.now();
  const { heapTotal, heapUsed } = process.memoryUsage();

  logger.log({
    level: "info",
    action: "setup",
    msg: `heapTotal memory usage before: ${formatMemoryUsage(heapTotal)}`,
  });
  logger.log({
    level: "info",
    action: "setup",
    msg: `heapUsed memory usage before: ${formatMemoryUsage(heapUsed)}`,
  });

  await startMongoServerAndSetEnvConnectionString();

  const end = performance.now();

  logger.log({
    level: "info",
    action: "setup",
    msg: `completed in ${(end - start).toFixed(2)} ms - ⏱️`,
  });
};

export const teardown = async (): Promise<void> => {
  logger.log({
    level: "info",
    action: "teardown",
    msg: "starting",
  });

  const start = performance.now();
  const { heapTotal, heapUsed } = process.memoryUsage();

  logger.log({
    level: "info",
    action: "teardown",
    msg: `heapTotal memory usage after: ${formatMemoryUsage(heapTotal)}`,
  });

  logger.log({
    level: "info",
    action: "teardown",
    msg: `heapUsed memory usage after: ${formatMemoryUsage(heapUsed)}`,
  });

  await mongoTeardown();

  const end = performance.now();
  logger.log({
    level: "info",
    action: "teardown",
    msg: `completed in ${(end - start).toFixed(2)} ms - ⏱️`,
  });
};
