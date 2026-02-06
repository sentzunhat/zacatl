/**
 * GetAllGreetings Route Handler
 */

import { inject, singleton } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
import { GreetingService } from "../../domain/services/greeting.service";

@singleton()
export class GetAllGreetingsHandler extends AbstractRouteHandler<
  void,
  { language?: string },
  any[]
> {
  constructor(
    @inject(GreetingService)
    private readonly greetingService: GreetingService,
  ) {
    super({
      url: "/greetings",
      method: "GET",
      schema: {},
    });
  }

  async handler(request: Request<void, { language?: string }>): Promise<any[]> {
    const language = request.query?.language as string | undefined;
    return this.greetingService.getAllGreetings(language);
  }
}
