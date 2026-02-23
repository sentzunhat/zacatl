import { FastifyReply, FastifySchema } from "@zacatl/third-party/fastify";
import { z } from "@zacatl/third-party/zod";

import { RouteHandler } from "./route-handler";
import type { HTTPMethod } from "../../common/http-methods";
import type { Request } from "../../common/request";

export type { Request } from "../../common/request";

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
    request: Request<TBody, TQuerystring, TParams, THeaders>,
    reply: FastifyReply,
  ): Promise<HandlerOutput<TResponse>> {
    const response = await this.handler(request);

    // Only auto-send if the handler has not already sent the reply
    if (!reply.sent) {
      await reply.code(200).send(this.buildResponse(response));
    }

    return response;
  }
}
