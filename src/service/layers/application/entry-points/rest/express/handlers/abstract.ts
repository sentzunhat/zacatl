import { z } from "@zacatl/third-party/zod";
import type { Request as ExpressRequest, Response } from "express";

import type { HTTPMethod } from "../../common/http-methods";

export type { Request } from "../../common/request";

export type RouteSchema<
  TBody = void,
  TQuerystring = void,
  TParams = void,
  THeaders = void,
  TResponse = void,
> = {
  body?: z.ZodType<TBody>;
  querystring?: z.ZodType<TQuerystring>;
  params?: z.ZodType<TParams>;
  headers?: z.ZodType<THeaders>;
  response?: z.ZodType<TResponse>;
};

export type AbstractRouteHandlerConstructor = {
  url: string;
  method: HTTPMethod;
  schema: RouteSchema | Record<string, unknown>;
};

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
   * Override this to customise the success response shape.
   *
   * By default, the raw value returned by `handler()` is sent with status 200.
   * Handlers that need a different status code or envelope should override
   * `buildResponse()` to wrap the data differently.
   *
   * @example
   * // Standard JSON envelope (opt-in):
   * protected buildResponse(data: TResponse) {
   *   return { ok: true, message: 'Success', data };
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
