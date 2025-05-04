import { FastifyReply, FastifyRequest } from "fastify";

export type HookHandlerName =
  | "onRequest"
  | "preHandler"
  | "preValidation"
  | "preSerialization";

export type HookHandler = {
  name: HookHandlerName;
  execute: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
};
