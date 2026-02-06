/**
 * DeleteGreeting Route Handler
 */

import { inject, singleton } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
import type { FastifyReply } from "@sentzunhat/zacatl/third-party/fastify";
import { GreetingService } from "../../domain/services/greeting.service";

@singleton()
export class DeleteGreetingHandler extends AbstractRouteHandler<
  void,
  void,
  { success: boolean },
  { id: string }
> {
  constructor(
    @inject(GreetingService)
    private readonly greetingService: GreetingService,
  ) {
    super({
      url: "/greetings/:id",
      method: "DELETE",
      schema: {},
    });
  }

  async handler(
    request: Request<void, void, { id: string }>,
    reply: FastifyReply,
  ): Promise<{ success: boolean }> {
    void reply;
    const id = request.params?.id as string;
    const success = await this.greetingService.deleteGreeting(id);
    return { success };
  }
}
