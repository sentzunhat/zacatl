import { v4 as uuidv4 } from "uuid";
import { Optional } from "../optionals";

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
}

export interface CustomErrorArgs {
  message: string;
  code?: ErrorCode;
  reason?: Optional<string>;
  metadata?: Optional<Record<string, unknown>>;
  error?: Optional<Error>;
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

  constructor({
    message,
    code,
    reason,
    metadata,
    error,
    correlationId,
  }: CustomErrorArgs & { correlationId?: string }) {
    super(message);
    this.id = uuidv4();
    this.correlationId = correlationId || this.id;
    this.custom = true;
    this.name = this.constructor.name;
    this.code = code;
    this.reason = reason;
    this.metadata = metadata;
    this.error = error;
    this.time = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      reason: this.reason,
      metadata: this.metadata,
      error: this.error
        ? {
            name: this.error.name,
            message: this.error.message,
            stack: this.error.stack,
          }
        : undefined,
      time: this.time.toISOString(),
      id: this.id,
      correlationId: this.correlationId,
      stack: this.stack,
      custom: this.custom,
    };
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
      (this.code ? `\nCode: ` + this.code : "") +
      (this.reason ? `\nReason: ` + this.reason : "") +
      (this.metadata
        ? `\nMetadata: ` + JSON.stringify(this.metadata, null, 2)
        : "") +
      (this.error ? `\nCaused by: ` + this.error.toString() : "") +
      (this.stack ? `\nStack: ` + this.stack : "")
    );
  }
}
