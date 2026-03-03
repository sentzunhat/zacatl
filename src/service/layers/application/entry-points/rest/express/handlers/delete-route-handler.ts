import { AbstractRouteHandler } from './abstract';

export interface DeleteRouteHandlerConstructor {
  url: string;
  schema: Record<string, unknown>;
}

/**
 * Express DELETE Route Handler convenience class
 */
export abstract class DeleteRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> extends AbstractRouteHandler<TBody, TQuerystring, TResponse, TParams, THeaders> {
  constructor(args: DeleteRouteHandlerConstructor) {
    super({
      url: args.url,
      method: 'DELETE',
      schema: args.schema,
    });
  }
}
