/**
 * GetGreetingById Route Handler
 *
 * Demonstrates:
 * - Path parameters
 * - Nullable response
 * - Type-safe params
 */

import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';
import { AbstractRouteHandler, type Request } from '@sentzunhat/zacatl/service';
import type { FastifyReply } from '@sentzunhat/zacatl/third-party/fastify';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service';
import { type GreetingIdParams, type GreetingResponse } from '../greeting.schema';
import { toGreetingResponse } from '../greeting.serializer';

@singleton()
export class GetGreetingByIdHandler extends AbstractRouteHandler<
  void,
  void,
  GreetingResponse | null,
  GreetingIdParams
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: '/greetings/:id',
      method: 'GET',
      schema: {},
    });
  }

  async handler(request: Request<void, void, GreetingIdParams>): Promise<GreetingResponse | null> {
    const { id } = request.params;

    const greeting = await this.greetingService.getGreeting(id);

    return greeting ? toGreetingResponse(greeting) : null;
  }
}
