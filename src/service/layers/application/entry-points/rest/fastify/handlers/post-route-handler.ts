import { FastifySchema } from '@zacatl/third-party/fastify';

import { AbstractRouteHandler } from './abstract';
export type { Request } from './abstract';

export interface PostRouteHandlerConstructor {
  url: string;
  schema: FastifySchema;
}

export abstract class PostRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> extends AbstractRouteHandler<TBody, TQuerystring, TResponse, TParams, THeaders> {
  constructor(args: PostRouteHandlerConstructor) {
    super({
      url: args.url,
      method: 'POST',
      schema: args.schema,
    });
  }
}
