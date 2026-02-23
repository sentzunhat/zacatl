import { IncomingMessage } from 'http';

import { FastifySchema, FastifyRequest, RawServerBase } from '@zacatl/third-party/fastify';

export type Request<
  TBody = void,
  TQuerystring = void,
  TParams = void,
  THeaders = void,
> = FastifyRequest<
  {
    Body: TBody;
    Querystring: TQuerystring;
    Params: TParams;
    Headers: THeaders;
  },
  RawServerBase,
  IncomingMessage,
  FastifySchema
>;
