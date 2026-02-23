/**
 * Custom error primitives and types used across the framework.
 *
 * This module defines structured error types with correlation IDs and
 * helper constructors used by higher-level error wrappers.
 */
import { uuidv4 } from "@zacatl/third-party/uuid";

import type { Optional } from "../utils/optionals";

export type HttpStatusCode =
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 422 // Validation not met
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503; // Service Unavailable;

export type StatusCodeString = "invalid";

export type ErrorCode = Optional<HttpStatusCode | StatusCodeString>;

export interface CustomErrorsArgs {
  message: string;
  reason?: Optional<string>;
  metadata?: Optional<Record<string, unknown>>;
  error?: Optional<Error>;
  /** Component or module where error occurred (e.g., 'ConfigLoader', 'DIContainer') */
  component?: Optional<string>;
  /** Operation that failed (e.g., 'loadConfig', 'registerDependency') */
  operation?: Optional<string>;
}

export interface CustomErrorArgs {
  message: string;
  code?: ErrorCode;
  reason?: Optional<string>;
  metadata?: Optional<Record<string, unknown>>;
  error?: Optional<Error>;
  /** Component or module where error occurred (e.g., 'ConfigLoader', 'DIContainer') */
  component?: Optional<string>;
  /** Operation that failed (e.g., 'loadConfig', 'registerDependency') */
  operation?: Optional<string>;
}

export class CustomError extends Error {
  public readonly custom: boolean;
  public readonly code: ErrorCode;
  public readonly reason?: Optional<string>;
  public readonly metadata?: Optional<Record<string, unknown>>;
  public readonly error?: Optional<Error>;
  public readonly time: Date;
  public readonly id: string;
  public readonly correlationId: string;
  public readonly component?: Optional<string>;
  public readonly operation?: Optional<string>;

  constructor({
    message,
    code,
    reason,
    metadata,
    error,
    correlationId,
    component,
    operation,
  }: CustomErrorArgs & { correlationId?: string }) {
    super(message);
    this.id = uuidv4();
    this.correlationId = correlationId ?? uuidv4();
    this.custom = true;
    this.name = this.constructor.name;
    this.code = code;
    this.reason = reason;
    this.metadata = metadata;
    this.error = error;
    this.time = new Date();
    this.component = component;
    this.operation = operation;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): {
    name: string;
    message: string;
    code?: ErrorCode;
    reason?: string;
    metadata?: Record<string, unknown>;
    component?: string;
    operation?: string;
    error?: { name: string; message: string; stack?: string };
    time: string;
    id: string;
    correlationId: string;
    stack?: string | undefined;
    custom: boolean;
  } {
    const out: {
      name: string;
      message: string;
      code?: ErrorCode;
      reason?: string;
      metadata?: Record<string, unknown>;
      component?: string;
      operation?: string;
      error?: { name: string; message: string; stack?: string };
      time: string;
      id: string;
      correlationId: string;
      stack?: string | undefined;
      custom: boolean;
    } = {
      name: this.name,
      message: this.message,
      time: this.time.toISOString(),
      id: this.id,
      correlationId: this.correlationId,
      custom: this.custom,
    };

    if (this.code != null) out.code = this.code;
    if (this.reason != null) out.reason = this.reason;
    if (this.metadata != null) out.metadata = this.metadata;
    if (this.component != null) out.component = this.component;
    if (this.operation != null) out.operation = this.operation;
    if (this.stack != null) out.stack = this.stack;

    if (this.error != null) {
      const e: { name: string; message: string; stack?: string } = {
        name: this.error.name,
        message: this.error.message,
      };
      if (this.error.stack != null) e.stack = this.error.stack;
      out.error = e;
    }

    return out;
  }

  public override toString(): string {
    return (
      `[` +
      this.time.toISOString() +
      `] ` +
      this.name +
      `: ` +
      this.message +
      `\nCorrelationId: ` +
      this.correlationId +
      (this.code != null ? `\nCode: ${this.code}` : "") +
      (this.component != null ? `\nComponent: ${this.component}` : "") +
      (this.operation != null ? `\nOperation: ${this.operation}` : "") +
      (this.reason != null ? `\nReason: ${this.reason}` : "") +
      (this.metadata != null ? `\nMetadata: ${JSON.stringify(this.metadata, null, 2)}` : "") +
      (this.error != null ? `\nCaused by: ${this.error.toString()}` : "") +
      (this.stack != null ? `\nStack: ${this.stack}` : "")
    );
  }
}
