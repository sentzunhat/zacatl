import { CustomError, CustomErrorsArgs } from "./custom";

export interface BadRequestErrorArgs extends CustomErrorsArgs {}

export class BadRequestError extends CustomError {
  constructor({ message, reason, metadata, error }: BadRequestErrorArgs) {
    super({
      message,
      code: 400,
      reason,
      metadata,
      error,
    });
  }
}
