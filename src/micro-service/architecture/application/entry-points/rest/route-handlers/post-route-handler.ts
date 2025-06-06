import { FastifySchema } from "fastify";
import { AbstractRouteHandler } from "./abstract";

export type PostRouteHandlerConstructor = {
  url: string;
  schema: FastifySchema;
};

export abstract class PostRouteHandler<
  TBody = void,
  TResponse = void,
  TQuerystring = void,
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
