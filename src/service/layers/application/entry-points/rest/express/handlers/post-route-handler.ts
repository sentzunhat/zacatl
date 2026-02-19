import { AbstractRouteHandler } from "./abstract";
export type { Request } from "./abstract";

export type PostRouteHandlerConstructor = {
  url: string;
  schema: Record<string, unknown>;
};

/**
 * Express POST Route Handler convenience class
 */
export abstract class PostRouteHandler<
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
  constructor(args: PostRouteHandlerConstructor) {
    super({
      url: args.url,
      method: "POST",
      schema: args.schema,
    });
  }
}
