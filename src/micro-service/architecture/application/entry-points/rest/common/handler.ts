import { FastifyReply } from "fastify";

import { Request } from "./request";

export type Handler<
  TBody,
  TQuerystring = Record<string, string>,
  TParams = void
> = (
  request: Request<TBody, TQuerystring, TParams>,
  reply: FastifyReply
) => Promise<void>;
