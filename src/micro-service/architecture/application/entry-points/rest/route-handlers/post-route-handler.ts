import { z } from "zod";
import { FastifySchema } from "fastify";

import { AbstractRouteHandler } from "./abstract";

export type PostRouteHandlerConstructor = {
  url: string;
  schema: FastifySchema;
};

export abstract class PostRouteHandler<
  TBody = never,
  TResponse = never,
  TQuerystring = z.ZodSchema<Record<string, string>>,
  TParams = void
> extends AbstractRouteHandler<TBody, TQuerystring, TResponse, TParams> {
  constructor(args: PostRouteHandlerConstructor) {
    super({
      url: args.url,
      method: "POST",
      schema: args.schema,
    });
  }
}
