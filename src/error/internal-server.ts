import { CustomError, CustomErrorsArgs } from './custom';

export interface InternalServerErrorArgs extends CustomErrorsArgs {}

export class InternalServerError extends CustomError {
  constructor({ message, reason, metadata, error }: InternalServerErrorArgs) {
    super({
      message,
      code: 500,
      reason,
      metadata,
      error,
    });
  }
}
