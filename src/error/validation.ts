import { CustomError, type CustomErrorsArgs } from './custom';

export interface ValidationErrorArgs extends CustomErrorsArgs {}

export class ValidationError extends CustomError {
  constructor({ message, reason, metadata, error }: ValidationErrorArgs) {
    super({
      message,
      code: 422,
      reason,
      metadata,
      error,
    });
  }
}
