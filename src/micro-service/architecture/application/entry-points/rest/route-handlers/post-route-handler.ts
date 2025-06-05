import { FastifySchema } from "fastify";
import { AbstractRouteHandler } from "./abstract";

export type PostRouteHandlerConstructor = {
  url: string;
  schema: FastifySchema;
};

export abstract class PostRouteHandler<
  TBody = unknown,
  TResponse = unknown,
  TQuerystring = Record<string, string>,
  TParams = Record<string, string>
> extends AbstractRouteHandler<TBody, TQuerystring, TResponse, TParams> {
  constructor(args: PostRouteHandlerConstructor) {
    super({
      url: args.url,
      method: "POST",
      schema: args.schema,
    });
  }
}
