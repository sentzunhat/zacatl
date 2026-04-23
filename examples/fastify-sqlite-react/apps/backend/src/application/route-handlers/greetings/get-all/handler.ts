/**
 * GetAllGreetings Route Handler
 *
 * Demonstrates:
 * - Simple GET endpoint
 * - Optional query parameters
 * - Type-safe array response
 */

import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';
import { FastifyGetRouteHandler, type Request } from '@sentzunhat/zacatl/service';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service';
import {
  GreetingFilterQuerySchema,
  type GreetingFilterQuery,
  type GreetingListResponse,
} from '../greeting.schema';
import { toGreetingListResponse } from '../greeting.serializer';

@singleton()
export class GetAllGreetingsHandler extends FastifyGetRouteHandler<
  void,
  GreetingFilterQuery,
  GreetingListResponse
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: '/greetings',
      schema: {
        querystring: GreetingFilterQuerySchema,
      },
    });
  }

  async handler(request: Request<void, GreetingFilterQuery>): Promise<GreetingListResponse> {
    const language = request.query?.language;

    const greetings = await this.greetingService.getAllGreetings(language);

    return toGreetingListResponse(greetings);
  }
}
