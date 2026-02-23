import type { CustomError } from "@zacatl/error";
import type { ZodError } from "@zacatl/third-party/zod";

/**
 * Type guard to check if `error` is a standard `Error` instance.
 * @param error - Value to test.
 * @returns `true` when the value is an `Error` instance.
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Type guard to check if `error` is a `ZodError` (from Zod validation).
 * This performs a runtime shape check rather than using `instanceof` to
 * accommodate multiple Zod copies across package boundaries.
 *
 * @param error - Value to test.
 * @returns `true` when the value appears to be a ZodError.
 */
export const isZodError = (error: unknown): error is ZodError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "name" in error &&
    typeof (error as Record<string, unknown>)["name"] === "string" &&
    (error as Record<string, unknown>)["name"] === "ZodError"
  );
};

/**
 * Type guard to check if `error` is a `CustomError` from `@zacatl/error`.
 * Verifies the value is an `Error` and contains a `code` property.
 *
 * @param error - Value to test.
 * @returns `true` when `error` is a `CustomError`.
 */
export const isCustomError = (error: unknown): error is CustomError => {
  return isError(error) && "code" in error;
};

/**
 * Type guard to check if `error` is a Node.js error (commonly from fs/network)
 * that includes optional `code`, `errno` or `syscall` properties.
 *
 * @param error - Value to test.
 * @returns `true` when `error` is an Error with a `code` property.
 */
export const isNodeError = (error: unknown): error is NodeError => {
  return isError(error) && "code" in error;
};

type NodeError = Error & {
  code?: string;
  errno?: number;
  syscall?: string;
};

/**
 * Type guard to check if `error` is a `SyntaxError`.
 * @param error - Value to test.
 * @returns `true` when `error` is an instance of `SyntaxError`.
 */
export const isSyntaxError = (error: unknown): error is SyntaxError => {
  return error instanceof SyntaxError;
};
