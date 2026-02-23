import { AbstractRouteHandler } from './abstract';

export interface PutRouteHandlerConstructor {
  url: string;
  schema: Record<string, unknown>;
}

/**
 * Express PUT Route Handler convenience class
 */
export abstract class PutRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> extends AbstractRouteHandler<TBody, TQuerystring, TResponse, TParams, THeaders> {
  constructor(args: PutRouteHandlerConstructor) {
    super({
      url: args.url,
      method: 'PUT',
      schema: args.schema,
    });
  }
}
