/**
 * GetAllGreetings Route Handler
 *
 * Demonstrates:
 * - Simple GET endpoint
 * - Optional query parameters
 * - Type-safe array response
 */

import type { Request } from '@sentzunhat/zacatl/third-party/express';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { GetRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/express/handlers/get-route-handler';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service/adapter';
import { type GreetingListResponse } from '../greeting.schema';
import { toGreetingListResponse } from '../greeting.serializer';

@singleton()
export class GetAllGreetingsHandler extends GetRouteHandler<
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
      schema: {},
    });
  }

  async handler(
    request: Request<void, GreetingListResponse, void, { language?: string }>,
  ): Promise<GreetingListResponse> {
    const language = request.query?.language as string | undefined;

    const greetings = await this.greetingService.getAllGreetings(language);

    return toGreetingListResponse(greetings);
  }
}
