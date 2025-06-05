import { IncomingMessage } from "http";
import { FastifySchema, FastifyRequest, RawServerBase } from "fastify";

export type Request<
  TBody,
  TQuerystring = void,
  TParams = void
> = FastifyRequest<
  {
    Body: TBody;
    Querystring: TQuerystring;
    Params: TParams;
    Headers: Record<string, string>;
  },
  RawServerBase,
  IncomingMessage,
  FastifySchema
>;
