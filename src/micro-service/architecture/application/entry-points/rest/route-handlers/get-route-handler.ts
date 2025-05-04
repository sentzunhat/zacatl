import { z } from "zod";
import { FastifySchema } from "fastify";

import { AbstractRouteHandler } from "./abstract";

export type GetRouteHandlerConstructor = {
  url: string;
  schema: FastifySchema;
};

export abstract class GetRouteHandler<
  TBody = never,
  TResponse = never,
  TQuerystring = z.ZodSchema<Record<string, string>>,
  TParams = void
> extends AbstractRouteHandler<TBody, TQuerystring, TResponse, TParams> {
  constructor(args: GetRouteHandlerConstructor) {
    super({
      url: args.url,
      method: "GET",
      schema: args.schema,
    });
  }
}
