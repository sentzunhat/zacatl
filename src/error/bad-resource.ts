import { CustomError, CustomErrorsArgs } from './custom';

export interface BadResourceErrorArgs extends CustomErrorsArgs {}

export class BadResourceError extends CustomError {
  constructor({ message, reason, metadata, error }: BadResourceErrorArgs) {
    super({
      message,
      code: 400,
      reason,
      metadata,
      error,
    });
  }
}
