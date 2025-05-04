import i18n from "i18n";
import { z } from "zod";
import { HTTPMethods, FastifySchema, FastifyReply } from "fastify";

import { RouteHandler } from "./route-handler";
import { Request } from "../common/request";

export type AbstractRouteHandlerConstructor = {
  url: string;
  method: HTTPMethods;
  schema: FastifySchema;
};

export type HandlerOutput<TResponse> = TResponse;

export abstract class AbstractRouteHandler<
  TBody = void,
  TQuerystring = z.ZodSchema<Record<string, string>>,
  TResponse = void,
  TParams = void
> implements RouteHandler<TBody, TQuerystring, TParams>
{
  public url: string;
  public method: HTTPMethods;
  public schema: FastifySchema;

  constructor(args: AbstractRouteHandlerConstructor) {
    this.url = args.url;
    this.method = args.method;
    this.schema = args.schema;
  }

  abstract handler(
    request: Request<TBody, TQuerystring, TParams>,
    reply: FastifyReply
  ): Promise<HandlerOutput<TResponse>> | HandlerOutput<TResponse>;

  public async execute(
    request: Request<TBody, TQuerystring, TParams>,
    reply: FastifyReply
  ): Promise<void> {
    const response = await this.handler(request, reply);

    const defaultMessage = i18n.__("SUCCESS_MESSAGES.DEFAULT");

    await reply.code(200).send({
      ok: true,
      message: defaultMessage,
      data: response,
    });
  }
}
