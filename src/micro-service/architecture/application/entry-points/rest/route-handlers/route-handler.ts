import { FastifySchema, HTTPMethods } from "fastify";

import { Handler } from "../common/handler";

export type RouteHandler<
  TBody = void,
  TQuerystring = Record<string, string>,
  TParams = void
> = {
  url: string;
  method: HTTPMethods;
  schema: FastifySchema;
  execute: Handler<TBody, TQuerystring, TParams>;
};
