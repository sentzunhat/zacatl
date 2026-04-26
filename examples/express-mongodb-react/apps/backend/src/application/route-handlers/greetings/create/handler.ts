import type { Request } from '@sentzunhat/zacatl/third-party/express';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { PostRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/express/handlers/post-route-handler';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service/adapter';
import {
  CreateGreetingBodySchema,
  type CreateGreetingBody,
  type GreetingResponse,
} from '../greeting.schema';
import { toGreetingResponse } from '../greeting.serializer';

@singleton()
export class CreateGreetingHandler extends PostRouteHandler<CreateGreetingBody, void, GreetingResponse> {
  constructor(
    @inject(GreetingServiceAdapter) private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({ url: '/greetings', schema: { body: CreateGreetingBodySchema } });
  }

  async handler(request: Request<void, GreetingResponse, CreateGreetingBody, void>): Promise<GreetingResponse> {
    const { message, language } = request.body;
    const greeting = await this.greetingService.createGreeting({ message, language });
    return toGreetingResponse(greeting);
  }
}
