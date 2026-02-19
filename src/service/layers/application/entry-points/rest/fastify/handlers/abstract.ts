import { FastifyReply, FastifySchema } from "@zacatl/third-party/fastify";
import { z } from "@zacatl/third-party/zod";

import { RouteHandler } from "./route-handler";
import type { HTTPMethod } from "../../common/http-methods";
import type { Request } from "../../common/request";

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
  schema: RouteSchema | FastifySchema | Record<string, unknown>;
};

export type HandlerOutput<TResponse> = TResponse;

export abstract class AbstractRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> implements RouteHandler<TBody, TQuerystring, TResponse, TParams, THeaders> {
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
    reply: FastifyReply,
  ): Promise<HandlerOutput<TResponse>> | HandlerOutput<TResponse>;

  /**
   * Override this to customise the success response shape.
   *
   * By default, the raw value returned by `handler()` is sent with status 200.
   * Handlers that need a different status code or envelope should either:
   *   1. Call `reply.code(N).send(payload)` directly inside `handler()` — the
   *      adapter will detect that the reply is already sent and skip auto-send.
   *   2. Override `buildResponse()` to wrap the data differently.
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
    request: Request<TBody, TQuerystring, TParams, THeaders>,
    reply: FastifyReply,
  ): Promise<HandlerOutput<TResponse>> {
    const response = await this.handler(request, reply);

    // Only auto-send if the handler has not already sent the reply
    if (!reply.sent) {
      await reply.code(200).send(this.buildResponse(response));
    }

    return response;
  }
}
