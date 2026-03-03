/**
 * Console logger adapter types
 * @module logs/console/types
 */

/**
 * Configuration options for console logger adapter
 */
export interface ConsoleLoggerOptions {
  /** Enable ANSI color codes in output (default: true) */
  colors?: boolean;
  /** Include ISO timestamps in output (default: true) */
  timestamps?: boolean;
}
