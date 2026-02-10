import { FastifyReply, HTTPMethods, FastifySchema } from "fastify";

import type { Request } from "../common/request";

export interface RouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> {
  url: string;
  method: HTTPMethods;
  schema: Record<string, unknown> | FastifySchema;
  execute(
    request: Request<TBody, TQuerystring, TParams, THeaders>,
    reply: FastifyReply,
  ): Promise<TResponse> | TResponse;
}
