import {
  BadRequestError,
  BadResourceError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@zacatl/error';

/**
 * Maps common Zacatl error types to HTTP status codes and error messages.
 *
 * This is a transport-agnostic error mapper used by both Fastify and Express
 * route handlers to ensure consistent error handling across implementations.
 *
 * @param error - The error to map
 * @returns An object containing the status code and error message
 *
 * @example
 * const { statusCode, message } = mapErrorToStatusCode(error);
 * reply.status(statusCode).send({ message });
 */
export const mapErrorToStatusCode = (error: Error): {
  statusCode: number;
  message: string;
} => {
  if (error instanceof NotFoundError) {
    return {
      message: error.message,
      statusCode: 404,
    };
  }
  if (error instanceof BadRequestError || error instanceof BadResourceError) {
    return {
      message: error.message,
      statusCode: 400,
    };
  }
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      statusCode: 422,
    };
  }
  if (error instanceof UnauthorizedError) {
    return {
      message: error.message,
      statusCode: 401,
    };
  }
  if (error instanceof ForbiddenError) {
    return {
      message: error.message,
      statusCode: 403,
    };
  }
  if (error instanceof InternalServerError) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }
  return {
    message: 'Something went wrong',
    statusCode: 500,
  };
};
