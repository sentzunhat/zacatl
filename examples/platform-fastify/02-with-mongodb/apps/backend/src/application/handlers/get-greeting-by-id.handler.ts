/**
 * GetGreetingById Route Handler
 */

import { inject, singleton } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
import { GreetingService } from "../../domain/services/greeting.service";

@singleton()
export class GetGreetingByIdHandler extends AbstractRouteHandler<
  void,
  void,
  any,
  { id: string }
> {
  constructor(
    @inject(GreetingService)
    private readonly greetingService: GreetingService,
  ) {
    super({
      url: "/greetings/:id",
      method: "GET",
      schema: {},
    });
  }

  async handler(request: Request<void, void, { id: string }>): Promise<any> {
    const id = request.params?.id as string;
    return this.greetingService.getGreetingById(id);
  }
}
