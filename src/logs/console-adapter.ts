import type { LoggerPort, LoggerInput } from "./types";

/**
 * Lightweight console-based logger adapter for CLI, desktop apps,
 * and environments where structured logging is not needed.
 */
export class ConsoleLoggerAdapter implements LoggerPort {
  private readonly enableColors: boolean;
  private readonly enableTimestamps: boolean;

  constructor(options?: { colors?: boolean; timestamps?: boolean }) {
    this.enableColors = options?.colors ?? true;
    this.enableTimestamps = options?.timestamps ?? true;
  }

  private formatMessage(
    level: string,
    message: string,
    input?: LoggerInput,
  ): string {
    const timestamp = this.enableTimestamps
      ? `[${new Date().toISOString()}]`
      : "";
    const levelTag = `[${level.toUpperCase()}]`;

    let output = `${timestamp} ${levelTag} ${message}`;

    if (input) {
      const structured: Record<string, unknown> = {};

      if (input.data !== undefined) {
        structured["data"] = input.data;
      }

      if (input.details !== undefined) {
        structured["details"] = input.details;
      }

      if (Object.keys(structured).length > 0) {
        output += ` ${JSON.stringify(structured)}`;
      }
    }

    return output;
  }

  private colorize(text: string, color: string): string {
    if (!this.enableColors) return text;

    const colors: Record<string, string> = {
      reset: "\x1b[0m",
      red: "\x1b[31m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      gray: "\x1b[90m",
      magenta: "\x1b[35m",
    };

    return `${colors[color] || ""}${text}${colors["reset"]}`;
  }

  log(message: string, input?: LoggerInput): void {
    this.info(message, input);
  }

  info(message: string, input?: LoggerInput): void {
    const formatted = this.formatMessage("info", message, input);
    console.log(this.colorize(formatted, "blue"));
  }

  trace(message: string, input?: LoggerInput): void {
    const formatted = this.formatMessage("trace", message, input);
    console.log(this.colorize(formatted, "gray"));
  }

  warn(message: string, input?: LoggerInput): void {
    const formatted = this.formatMessage("warn", message, input);
    console.warn(this.colorize(formatted, "yellow"));
  }

  error(message: string, input?: LoggerInput): void {
    const formatted = this.formatMessage("error", message, input);
    console.error(this.colorize(formatted, "red"));
  }

  fatal(message: string, input?: LoggerInput): void {
    const formatted = this.formatMessage("fatal", message, input);
    console.error(this.colorize(formatted, "magenta"));
  }
}
