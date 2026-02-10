import { BaseRepository, ORMType } from "@sentzunhat/zacatl";
import type { ModelStatic } from "@sentzunhat/zacatl/third-party/sequelize";
import { singleton } from "tsyringe";

import type {
  CreateGreetingInput,
  Greeting,
} from "../../../../domain/models/greeting";
import { GreetingModel } from "../../models/greeting.model";
import type { GreetingRepositoryPort } from "./port";

@singleton()
export class GreetingRepositoryAdapter
  extends BaseRepository<GreetingModel, CreateGreetingInput, Greeting>
  implements GreetingRepositoryPort
{
  constructor() {
    super({
      type: ORMType.Sequelize,
      model: GreetingModel,
    });
  }

  async findAll(filter?: { language?: string }): Promise<Greeting[]> {
    const where = filter?.language ? { language: filter.language } : {};
    const models = await (this.model as ModelStatic<GreetingModel>).findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return models
      .map((model) => this.toLean(model))
      .filter((item): item is Greeting => item !== null);
  }
}
