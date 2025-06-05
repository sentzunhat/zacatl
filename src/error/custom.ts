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

  constructor({ message, code, reason, metadata, error }: CustomErrorArgs) {
    super(message);
    this.id = uuidv4();
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
}
