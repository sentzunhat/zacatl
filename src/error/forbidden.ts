import { CustomError, CustomErrorsArgs } from "./custom";

export interface ForbiddenErrorArgs extends CustomErrorsArgs {}

export class ForbiddenError extends CustomError {
  constructor({ message, reason, metadata, error }: ForbiddenErrorArgs) {
    super({
      message,
      code: 403,
      reason,
      metadata,
      error,
    });
  }
}
