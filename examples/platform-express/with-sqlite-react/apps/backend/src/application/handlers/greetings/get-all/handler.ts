/**
 * GetAllGreetings Route Handler
 *
 * Demonstrates:
 * - Simple GET endpoint
 * - Optional query parameters
 * - Type-safe array response
 */

import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';
import { AbstractRouteHandler, type Request } from '@sentzunhat/zacatl/service';
import type { FastifyReply } from '@sentzunhat/zacatl/third-party/fastify';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service';
import { type GreetingListResponse } from '../greeting.schema';
import { toGreetingListResponse } from '../greeting.serializer';

@singleton()
export class GetAllGreetingsHandler extends AbstractRouteHandler<
  void,
  { language?: string },
  GreetingListResponse
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: '/greetings',
      method: 'GET',
      schema: {},
    });
  }

  async handler(request: Request<void, { language?: string }>): Promise<GreetingListResponse> {
    const language = request.query?.language as string | undefined;

    const greetings = await this.greetingService.getAllGreetings(language);

    return toGreetingListResponse(greetings);
  }
}
