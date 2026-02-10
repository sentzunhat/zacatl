import { FastifyReply } from "@zacatl/third-party/fastify";

import { Request } from "./request";

export type Handler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> = (
  request: Request<TBody, TQuerystring, TParams, THeaders>,
  reply: FastifyReply,
) => Promise<TResponse> | TResponse;
