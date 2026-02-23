import type { Request as ExpressRequest, Response } from 'express';

import { z } from '@zacatl/third-party/zod';

import type { HTTPMethod } from '../../common/http-methods';

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
  schema: RouteSchema | Record<string, unknown>;
}

export type HandlerOutput<TResponse> = TResponse;

/**
 * Express-specific Abstract Route Handler
 *
 * Compatible with Fastify's AbstractRouteHandler API but uses Express types.
 * The ExpressApiAdapter translates this to Express middleware at runtime.
 *
 * @template TBody - Request body type (available via request.body)
 * @template TQuerystring - Query parameters type (available via request.query)
 * @template TResponse - Response data type
 * @template TParams - URL parameters type (available via request.params)
 * @template THeaders - Headers type (available via request.headers)
 */
export abstract class AbstractRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> {
  public url: string;
  public method: HTTPMethod;
  public schema: RouteSchema | Record<string, unknown>;

  // Phantom types for type safety in derived classes
  protected readonly _phantomBody?: TBody;
  protected readonly _phantomQuerystring?: TQuerystring;
  protected readonly _phantomParams?: TParams;
  protected readonly _phantomHeaders?: THeaders;

  constructor(args: AbstractRouteHandlerConstructor) {
    this.url = args.url;
    this.method = args.method;
    this.schema = args.schema;
  }

  abstract handler(
    request: ExpressRequest<TParams, TResponse, TBody, TQuerystring>,
  ): Promise<HandlerOutput<TResponse>> | HandlerOutput<TResponse>;

  /**
   * Wraps the handler response before sending to the client.
   *
   * Override this method to customize the response shape (e.g., add an envelope,
   * change the status code, or return raw data).
   *
   * @default Returns the handler result as-is; use `buildResponse()` to wrap it
   *
   * @example
   * // Add standard envelope:
   * protected buildResponse(data: TResponse) {
   *   return { ok: true, message: "Success", data };
   * }
   *
   * @example
   * // Return raw data:
   * protected buildResponse(data: TResponse) {
   *   return data;
   * }
   */
  protected buildResponse(
    data: HandlerOutput<TResponse>,
  ): HandlerOutput<TResponse> | Record<string, unknown> {
    return data as HandlerOutput<TResponse>;
  }

  public async execute(
    request: ExpressRequest<TParams, TResponse, TBody, TQuerystring>,
    reply: Response,
  ): Promise<HandlerOutput<TResponse>> {
    const response = await this.handler(request);

    // Only auto-send if the handler has not already sent the reply
    if (!reply.headersSent) {
      reply.status(200).send(this.buildResponse(response));
    }

    return response;
  }
}
