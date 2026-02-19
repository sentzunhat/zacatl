import { FastifySchema } from "@zacatl/third-party/fastify";

import { AbstractRouteHandler } from "./abstract";

export type PutRouteHandlerConstructor = {
  url: string;
  schema: FastifySchema;
};

/**
 * Fastify PUT Route Handler convenience class
 */
export abstract class PutRouteHandler<
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
  constructor(args: PutRouteHandlerConstructor) {
    super({
      url: args.url,
      method: "PUT",
      schema: args.schema,
    });
  }
}
