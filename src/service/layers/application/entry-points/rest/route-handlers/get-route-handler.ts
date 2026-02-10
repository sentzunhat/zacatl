import { FastifySchema } from "fastify";

import { AbstractRouteHandler } from "./abstract";

export type GetRouteHandlerConstructor = {
  url: string;
  schema: FastifySchema;
};

export abstract class GetRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> extends AbstractRouteHandler<
  TBody,
  TQuerystring,
  TResponse,
  TParams,
  THeaders
> {
  constructor(args: GetRouteHandlerConstructor) {
    super({
      url: args.url,
      method: "GET",
      schema: args.schema,
    });
  }
}
