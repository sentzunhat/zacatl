/**
 * GetRandomGreeting Route Handler
 *
 * Demonstrates:
 * - Path parameters
 * - Nullable response handling
 * - Type-safe params
 */

import { inject, singleton } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
import type { FastifyReply } from "@sentzunhat/zacatl/third-party/fastify";
import { GreetingServiceAdapter } from "../../../../domain/greetings/service";
import { type GreetingParams, type GreetingResponse } from "../greeting.schema";
import { toGreetingResponse } from "../greeting.serializer";

@singleton()
export class GetRandomGreetingHandler extends AbstractRouteHandler<
  void,
  void,
  GreetingResponse | null,
  GreetingParams
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: "/greetings/random/:language",
      method: "GET",
      schema: {},
    });
  }

  async handler(
    request: Request<void, void, GreetingParams>,
    reply: FastifyReply,
  ): Promise<GreetingResponse | null> {
    void reply;

    const { language } = request.params;

    const greeting = await this.greetingService.getRandomGreeting(language);

    return greeting ? toGreetingResponse(greeting) : null;
  }
}
