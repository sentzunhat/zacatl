import { CustomError, type CustomErrorsArgs } from './custom';

export interface UnauthorizedErrorArgs extends CustomErrorsArgs {}

export class UnauthorizedError extends CustomError {
  constructor({ message, reason, metadata, error }: UnauthorizedErrorArgs) {
    super({
      message,
      code: 401,
      reason,
      metadata,
      error,
    });
  }
}
