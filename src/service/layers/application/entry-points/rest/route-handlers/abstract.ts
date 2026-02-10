import {
  HTTPMethods,
  FastifyReply,
  FastifySchema,
} from "@zacatl/third-party/fastify";
import i18n from "@zacatl/third-party/i18n";
import { z } from "@zacatl/third-party/zod";

import { RouteHandler } from "./route-handler";
import type { Request } from "../common/request";

export type { Request } from "../common/request";

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
  method: HTTPMethods;
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
  public method: HTTPMethods;
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

  public async execute(
    request: Request<TBody, TQuerystring, TParams, THeaders>,
    reply: FastifyReply,
  ): Promise<HandlerOutput<TResponse>> {
    const response = await this.handler(request, reply);

    const defaultMessage = i18n.__("SUCCESS_MESSAGES.DEFAULT");

    await reply.code(200).send({
      ok: true,
      message: defaultMessage,
      data: response,
    });

    return response;
  }
}
