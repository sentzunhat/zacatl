/**
 * CreateGreeting Route Handler
 */

import { singleton, inject } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
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
  ): Promise<any> {
    const { message, language } = request.body as {
      message: string;
      language: string;
    };
    return this.greetingService.createGreeting({ message, language });
  }
}
