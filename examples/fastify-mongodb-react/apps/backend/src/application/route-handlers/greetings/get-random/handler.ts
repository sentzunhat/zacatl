/**
 * GetRandomGreeting Route Handler
 *
 * Demonstrates:
 * - Path parameters
 * - Nullable response handling
 * - Type-safe params
 */

import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import type { Request } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/abstract';
import { GetRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/get-route-handler';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service/adapter';
import { type GreetingParams, type GreetingResponse } from '../greeting.schema';
import { toGreetingResponse } from '../greeting.serializer';

@singleton()
export class GetRandomGreetingHandler extends GetRouteHandler<
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
      url: '/greetings/random/:language',
      schema: {},
    });
  }

  async handler(request: Request<void, void, GreetingParams>): Promise<GreetingResponse | null> {
    const { language } = request.params;

    const greeting = await this.greetingService.getRandomGreeting(language);

    return greeting ? toGreetingResponse(greeting) : null;
  }
}
