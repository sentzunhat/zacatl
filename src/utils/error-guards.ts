import type { CustomError } from "@zacatl/error";
import type { ZodError } from "@zacatl/third-party/zod";

/**
 * Type guard to check if error is a standard Error instance
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Type guard to check if error is a ZodError
 */
export const isZodError = (error: unknown): error is ZodError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "ZodError"
  );
};

/**
 * Type guard to check if error is a CustomError
 */
export const isCustomError = (error: unknown): error is CustomError => {
  return isError(error) && error instanceof Error && "code" in error;
};

/**
 * Type guard to check if error is a Node.js filesystem error with code
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
 * Type guard to check if error is a SyntaxError
 */
export const isSyntaxError = (error: unknown): error is SyntaxError => {
  return error instanceof SyntaxError;
};
