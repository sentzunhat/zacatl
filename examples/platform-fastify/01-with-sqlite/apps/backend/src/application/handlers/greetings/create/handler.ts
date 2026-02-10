/**
 * CreateGreeting Route Handler
 *
 * Demonstrates:
 * - Zod schema validation
 * - Type-safe request/response
 * - Service injection
 * - Response serialization
 */

import { inject, singleton } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
import type { FastifyReply } from "@sentzunhat/zacatl/third-party/fastify";
import { GreetingServiceAdapter } from "../../../../domain/greetings/service";
import {
  CreateGreetingBodySchema,
  type CreateGreetingBody,
  type GreetingResponse,
} from "../greeting.schema";
import { toGreetingResponse } from "../greeting.serializer";

@singleton()
export class CreateGreetingHandler extends AbstractRouteHandler<
  CreateGreetingBody,
  void,
  GreetingResponse
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: "/greetings",
      method: "POST",
      schema: {
        body: CreateGreetingBodySchema,
      },
    });
  }

  async handler(
    request: Request<CreateGreetingBody>,
    reply: FastifyReply,
  ): Promise<GreetingResponse> {
    void reply;

    const { message, language } = request.body;

    const greeting = await this.greetingService.createGreeting({
      message,
      language,
    });

    return toGreetingResponse(greeting);
  }
}
