import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/sequelize/repository';
import type { ModelStatic } from '@sentzunhat/zacatl/third-party/databases/sequelize';
import { singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';

import type { CreateGreetingInput, Greeting } from '../../../../domain/entities/greeting';
import { GreetingModel } from '../../models/greeting.model';
import type { GreetingRepositoryPort } from './port';

@singleton()
export class GreetingRepositoryAdapter
  extends BaseRepository<GreetingModel, CreateGreetingInput, Greeting>
  implements GreetingRepositoryPort
{
  constructor() {
    super({
      name: GreetingModel.name,
    });
  }

  async findAll(filter?: { language?: string }): Promise<Greeting[]> {
    const where = filter?.language ? { language: filter.language } : {};
    const models = await (this.model as ModelStatic<GreetingModel>).findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return models
      .map((model: GreetingModel) => this.toLean(model))
      .filter((item: Greeting | null): item is Greeting => item !== null);
  }
}
