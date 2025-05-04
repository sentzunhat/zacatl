import { z } from "zod";
import { IncomingMessage } from "http";
import { FastifySchema, FastifyRequest, RawServerBase } from "fastify";

export type Request<
  TBody,
  TQuerystring = z.ZodSchema<Record<string, string>>,
  TParams = void
> = FastifyRequest<
  {
    Body: TBody;
    Querystring: TQuerystring;
    Params: TParams;
    Headers: z.ZodSchema<Record<string, string>>;
  },
  RawServerBase,
  IncomingMessage,
  FastifySchema
>;
