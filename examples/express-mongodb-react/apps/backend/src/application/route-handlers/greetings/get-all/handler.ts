import type { Request } from '@sentzunhat/zacatl/third-party/express';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { GetRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/express/handlers/get-route-handler';
import { GreetingServiceAdapter } from '../../../../domain/greetings/service/adapter';
import {
  GreetingFilterQuerySchema,
  type GreetingFilterQuery,
  type GreetingListResponse,
} from '../greeting.schema';
import { toGreetingListResponse } from '../greeting.serializer';

@singleton()
export class GetAllGreetingsHandler extends GetRouteHandler<void, GreetingFilterQuery, GreetingListResponse> {
  constructor(
    @inject(GreetingServiceAdapter) private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({ url: '/greetings', schema: { querystring: GreetingFilterQuerySchema } });
  }

  async handler(request: Request<void, GreetingListResponse, void, GreetingFilterQuery>): Promise<GreetingListResponse> {
    const language = request.query?.language;
    const greetings = await this.greetingService.getAllGreetings(language);
    return toGreetingListResponse(greetings);
  }
}
