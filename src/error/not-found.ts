import { CustomError, CustomErrorsArgs } from './custom';

export interface NotFoundErrorArgs extends CustomErrorsArgs {}

export class NotFoundError extends CustomError {
  constructor({ message, reason, metadata, error }: NotFoundErrorArgs) {
    super({
      message,
      code: 404,
      reason,
      metadata,
      error,
    });
  }
}
