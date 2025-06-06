import { FastifyReply } from "fastify";

import { Request } from "./request";

export type Handler<
  TBody = void,
  TQuerystring = void,
  TParams = void,
  THeaders = void
> = (
  request: Request<TBody, TQuerystring, TParams, THeaders>,
  reply: FastifyReply
) => Promise<void>;
