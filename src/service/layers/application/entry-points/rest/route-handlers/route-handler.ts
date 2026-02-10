import { HTTPMethods, FastifySchema } from "fastify";

import { Handler } from "../common/handler";

export type RouteHandler<
  TBody = void,
  TQuerystring = void,
  TParams = void,
  THeaders = void,
  TReply = unknown,
> = {
  url: string;
  method: HTTPMethods;
  schema: Record<string, unknown> | FastifySchema;
  execute: Handler<TBody, TQuerystring, TParams, THeaders, TReply>;
};
