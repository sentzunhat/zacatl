import {
  FastifyReply,
  HTTPMethods,
  FastifySchema,
} from "@zacatl/third-party/fastify";

import type { Request } from "../common/request";

export interface RouteHandler<
  TBody = unknown,
  TQuerystring = unknown,
  TResponse = unknown,
  TParams = unknown,
  THeaders = unknown,
> {
  url: string;
  method: HTTPMethods;
  schema: Record<string, unknown> | FastifySchema;
  execute(
    request: Request<TBody, TQuerystring, TParams, THeaders>,
    reply: FastifyReply,
  ): Promise<TResponse> | TResponse;
}
