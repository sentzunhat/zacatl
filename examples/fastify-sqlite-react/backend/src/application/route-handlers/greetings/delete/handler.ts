/**
 * DeleteGreeting Route Handler
 *
 * Demonstrates:
 * - DELETE method
 * - Path parameters
 * - Simple success response
 */

import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';
import { FastifyDeleteRouteHandler, type Request } from '@sentzunhat/zacatl/service';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service';
import { type GreetingIdParams } from '../greeting.schema.js';

@singleton()
export class DeleteGreetingHandler extends FastifyDeleteRouteHandler<
  void,
  void,
  { success: boolean },
  GreetingIdParams
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: '/greetings/:id',
      schema: {},
    });
  }

  async handler(request: Request<void, void, GreetingIdParams>): Promise<{ success: boolean }> {
    const { id } = request.params;
    const success = await this.greetingService.deleteGreeting(id);
    return { success };
  }
}
