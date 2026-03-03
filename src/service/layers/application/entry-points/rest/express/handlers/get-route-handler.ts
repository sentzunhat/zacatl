import { AbstractRouteHandler } from './abstract';

export interface GetRouteHandlerConstructor {
  url: string;
  schema: Record<string, unknown>;
}

/**
 * Express GET Route Handler convenience class
 */
export abstract class GetRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> extends AbstractRouteHandler<TBody, TQuerystring, TResponse, TParams, THeaders> {
  constructor(args: GetRouteHandlerConstructor) {
    super({
      url: args.url,
      method: 'GET',
      schema: args.schema,
    });
  }
}
