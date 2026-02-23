import type { Request } from './request';

export type Handler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> = (request: Request<TBody, TQuerystring, TParams, THeaders>) => Promise<TResponse> | TResponse;
