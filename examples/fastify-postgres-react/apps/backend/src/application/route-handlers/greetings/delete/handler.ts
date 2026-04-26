import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import type { Request } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/abstract';
import { DeleteRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/delete-route-handler';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service/adapter';
import { type GreetingIdParams } from '../greeting.schema';

@singleton()
export class DeleteGreetingHandler extends DeleteRouteHandler<void, void, { success: boolean }, GreetingIdParams> {
  constructor(
    @inject(GreetingServiceAdapter) private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({ url: '/greetings/:id', schema: {} });
  }

  async handler(request: Request<void, void, GreetingIdParams>): Promise<{ success: boolean }> {
    const { id } = request.params;
    const success = await this.greetingService.deleteGreeting(id);
    return { success };
  }
}
