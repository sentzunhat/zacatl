import { MongooseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose';
import type { MongooseModel } from '@sentzunhat/zacatl/third-party/mongoose';
import { singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

import type { CreateGreetingInput, Greeting } from '../../../../domain/entities/greeting';
import type { GreetingRepositoryPort } from './port';
import { greetingSchema } from './schema';

@singleton()
export class GreetingRepositoryAdapter
  extends MongooseRepository<Greeting, CreateGreetingInput, Greeting>
  implements GreetingRepositoryPort
{
  constructor() {
    super({
      name: 'greeting',
      schema: greetingSchema,
    });
  }

  async findAll(filter?: { language?: string }): Promise<Greeting[]> {
    const where = filter?.language ? { language: filter.language } : {};
    const docs = await (this.model as MongooseModel<Greeting>)
      .find(where)
      .sort({ createdAt: -1 })
      .lean<Greeting[]>()
      .exec();

    return docs.map((doc) => this.toLean(doc)).filter((item): item is Greeting => item !== null);
  }

  async delete(id: string): Promise<Greeting | null> {
    return super.delete(id);
  }
}
