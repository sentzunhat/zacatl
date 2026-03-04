import {
  BadRequestError,
  BadResourceError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@zacatl/error';
import type { FastifyReply, FastifySchema } from '@zacatl/third-party/fastify';
import type { z } from '@zacatl/third-party/zod';

import type { RouteHandler } from './route-handler';
import type { HTTPMethod } from '../../common/http-methods';
import type { Request } from '../../common/request';

export type { Request } from '../../common/request';

export interface RouteSchema<
  TBody = void,
  TQuerystring = void,
  TParams = void,
  THeaders = void,
  TResponse = void,
> {
  body?: z.ZodType<TBody>;
  querystring?: z.ZodType<TQuerystring>;
  params?: z.ZodType<TParams>;
  headers?: z.ZodType<THeaders>;
  response?: z.ZodType<TResponse>;
}

export interface AbstractRouteHandlerConstructor {
  url: string;
  method: HTTPMethod;
  schema: RouteSchema | FastifySchema | Record<string, unknown>;
}

export type HandlerOutput<TResponse> = TResponse;

export abstract class AbstractRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> implements RouteHandler<TBody, TQuerystring, TResponse, TParams, THeaders>
{
  public url: string;
  public method: HTTPMethod;
  public schema: RouteSchema | FastifySchema | Record<string, unknown>;

  constructor(args: AbstractRouteHandlerConstructor) {
    this.url = args.url;
    this.method = args.method;
    this.schema = args.schema;
  }

  abstract handler(
    request: Request<TBody, TQuerystring, TParams, THeaders>,
  ): Promise<HandlerOutput<TResponse>> | HandlerOutput<TResponse>;

  /**
   * Handle errors and format error responses with appropriate status codes.
   *
   * Override this method to customize error handling and response format.
   * Maps common Zacatl error types to appropriate HTTP status codes automatically.
   * Returns the error message directly with statusCode, without a hardcoded envelope.
   *
   * @default Maps NotFoundError→404, BadRequestError→400, ValidationError→422,
   *          UnauthorizedError→401, ForbiddenError→403, others→500
   *
   * @example
   * // Custom error handling:
   * protected handleError(error: Error) {
   *   if (error instanceof NotFoundError) {
   *     return { type: 'NOT_FOUND', message: error.message, statusCode: 404 };
   *   }
   *   return { type: 'ERROR', message: 'Something went wrong', statusCode: 500 };
   * }
   */
  protected handleError(error: Error): {
    statusCode: number;
    [key: string]: unknown;
  } {
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
  }

  public async execute(
    request: Request<TBody, TQuerystring, TParams, THeaders>,
    reply: FastifyReply,
  ): Promise<HandlerOutput<TResponse>> {
    try {
      const result = await this.handler(request);

      // Only auto-send if the handler has not already sent the reply
      if (!reply.sent) {
        await reply.send(result);
      }

      return result;
    } catch (error) {
      // Only auto-send error if the handler has not already sent the reply
      if (!reply.sent) {
        const errorResponse = this.handleError(error as Error);
        const statusCode =
          typeof errorResponse === 'object' &&
          errorResponse !== null &&
          'statusCode' in errorResponse
            ? errorResponse.statusCode || 500
            : 500;

        let body: { [key: string]: unknown } = errorResponse;
        if (
          typeof errorResponse === 'object' &&
          errorResponse !== null &&
          'statusCode' in errorResponse
        ) {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          const { statusCode: _, ...rest } = errorResponse;
          body = rest;
        }

        await reply.code(statusCode).send(body);
      }

      throw error;
    }
  }
}
