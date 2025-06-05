import { IncomingMessage } from "http";
import { FastifySchema, FastifyRequest, RawServerBase } from "fastify";

export type Request<
  TBody,
  TQuerystring = Record<string, string>,
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
