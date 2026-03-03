import type { ConsoleLoggerOptions } from './types';

/**
 * Creates default console logger configuration
 *
 * @param options - Optional configuration overrides
 * @returns Console logger options with sensible defaults
 *
 * @example
 * ```typescript
 * import { createConsoleConfig } from '@sentzunhat/zacatl/logs';
 *
 * const config = createConsoleConfig({
 *   colors: false,
 *   timestamps: true
 * });
 * ```
 */
export const createConsoleConfig = (
  options?: Partial<ConsoleLoggerOptions>,
): ConsoleLoggerOptions => {
  return {
    colors: options?.colors ?? true,
    timestamps: options?.timestamps ?? true,
  };
};
