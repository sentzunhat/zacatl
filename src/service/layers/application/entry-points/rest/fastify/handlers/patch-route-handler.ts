import { FastifySchema } from "@zacatl/third-party/fastify";

import { AbstractRouteHandler } from "./abstract";

export type PatchRouteHandlerConstructor = {
  url: string;
  schema: FastifySchema;
};

/**
 * Fastify PATCH Route Handler convenience class
 */
export abstract class PatchRouteHandler<
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
  constructor(args: PatchRouteHandlerConstructor) {
    super({
      url: args.url,
      method: "PATCH",
      schema: args.schema,
    });
  }
}
