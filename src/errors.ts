import { ZodError } from "zod";
import { isError } from "lodash";

import { logger } from "./logs";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

const isZodError = (error: unknown): error is ZodError =>
  isError(error) && "ZodError" === error.name;

const handleApiError = async (handler: () => Promise<void>) => {
  try {
    await handler();
  } catch (err) {
    const { request, response } = err as {
      request: { data: unknown };
      response: { data: unknown };
    };
    if (request)
      logger.error("request", { logData: { request: { data: request.data } } });
    if (response)
      logger.error("response", {
        logData: { response: { data: response.data } },
      });

    if (err) {
      logger.error("errored", { logData: { error: err } });
      throw err;
    }
  }
};

const handleRouteError = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  console.log("====================================");
  console.log({ request });
  console.log("====================================");

  if (isZodError(error)) {
    const zodError = error as ZodError;
    const logDataZodError = {
      name: zodError.name,
      issues: zodError.issues,
    };
    return reply.status(400).send({ ok: false, error: logDataZodError });
  }

  if (error instanceof SyntaxError) {
    reply.status(400).send({ error: "Bad Request", message: error.message });
  } else if (error instanceof ZodError) {
    reply
      .status(422)
      .send({ error: "Validation Error", message: error.errors });
  } else {
    reply
      .status(500)
      .send({ error: "Internal Server Error", message: error.message });
  }

  return reply.status(400).send({
    ok: false,
    error: {
      name: error.name,
      message: error.message,
      error,
    },
  });
};

export { isZodError, handleApiError, handleRouteError };
