/**
 * UpdateGreeting Route Handler
 *
 * Demonstrates:
 * - PUT method with path parameters
 * - Partial-update body validation
 * - Response serialization
 */

import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import type { Request } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/abstract';
import { PutRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/put-route-handler';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service';
import {
  UpdateGreetingBodySchema,
  type UpdateGreetingBody,
  type GreetingResponse,
  type GreetingIdParams,
} from '../greeting.schema';
import { toGreetingResponse } from '../greeting.serializer';

@singleton()
export class UpdateGreetingHandler extends PutRouteHandler<
  UpdateGreetingBody,
  void,
  GreetingResponse,
  GreetingIdParams
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: '/greetings/:id',
      schema: {
        body: UpdateGreetingBodySchema,
      },
    });
  }

  async handler(
    request: Request<UpdateGreetingBody, void, GreetingIdParams>,
  ): Promise<GreetingResponse> {
    const { id } = request.params;
    const greeting = await this.greetingService.updateGreeting(id, request.body);
    return toGreetingResponse(greeting);
  }
}
