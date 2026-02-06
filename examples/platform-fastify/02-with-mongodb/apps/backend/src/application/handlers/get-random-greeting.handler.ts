/**
 * GetRandomGreeting Route Handler
 */

import { inject, singleton } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
import { GreetingService } from "../../domain/services/greeting.service";

@singleton()
export class GetRandomGreetingHandler extends AbstractRouteHandler<
  void,
  void,
  any,
  { language: string }
> {
  constructor(
    @inject(GreetingService)
    private readonly greetingService: GreetingService,
  ) {
    super({
      url: "/greetings/random/:language",
      method: "GET",
      schema: {},
    });
  }

  async handler(
    request: Request<void, void, { language: string }>,
  ): Promise<any> {
    const language = request.params?.language as string;
    return this.greetingService.getRandomGreeting(language);
  }
}
