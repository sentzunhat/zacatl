import type { Request } from '@sentzunhat/zacatl/third-party/express';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { GetRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/express/handlers/get-route-handler';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service/adapter';
import { type GreetingIdParams, type GreetingResponse } from '../greeting.schema';
import { toGreetingResponse } from '../greeting.serializer';

@singleton()
export class GetGreetingByIdHandler extends GetRouteHandler<void, void, GreetingResponse | null, GreetingIdParams> {
  constructor(
    @inject(GreetingServiceAdapter) private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({ url: '/greetings/:id', schema: {} });
  }

  async handler(request: Request<GreetingIdParams, GreetingResponse | null, void, void>): Promise<GreetingResponse | null> {
    const { id } = request.params;
    const greeting = await this.greetingService.getGreeting(id);
    return greeting ? toGreetingResponse(greeting) : null;
  }
}
