/**
 * CreateGreeting Route Handler
 *
 * Demonstrates:
 * - Zod schema validation
 * - Type-safe request/response
 * - Service injection
 * - Response serialization
 */

import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';
import { FastifyPostRouteHandler, type Request } from '@sentzunhat/zacatl/service';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service';
import {
  CreateGreetingBodySchema,
  type CreateGreetingBody,
  type GreetingResponse,
} from '../greeting.schema';
import { toGreetingResponse } from '../greeting.serializer';

@singleton()
export class CreateGreetingHandler extends FastifyPostRouteHandler<
  CreateGreetingBody,
  void,
  GreetingResponse
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: '/greetings',
      schema: {
        body: CreateGreetingBodySchema,
      },
    });
  }

  async handler(request: Request<CreateGreetingBody>): Promise<GreetingResponse> {
    const { message, language } = request.body;

    const greeting = await this.greetingService.createGreeting({
      message,
      language,
    });

    return toGreetingResponse(greeting);
  }
}
