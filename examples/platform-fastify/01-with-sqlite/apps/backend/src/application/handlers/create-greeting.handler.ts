/**
 * CreateGreeting Route Handler
 */

import { inject, singleton } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
import type { FastifyReply } from "@sentzunhat/zacatl/third-party/fastify";
import { GreetingService } from "../../domain/services/greeting.service";

@singleton()
export class CreateGreetingHandler extends AbstractRouteHandler<
  { message: string; language: string },
  void,
  any
> {
  constructor(
    @inject(GreetingService)
    private readonly greetingService: GreetingService,
  ) {
    super({
      url: "/greetings",
      method: "POST",
      schema: {},
    });
  }

  async handler(
    request: Request<{ message: string; language: string }>,
    reply: FastifyReply,
  ): Promise<any> {
    void reply;
    const { message, language } = request.body as {
      message: string;
      language: string;
    };
    return this.greetingService.createGreeting({ message, language });
  }
}
