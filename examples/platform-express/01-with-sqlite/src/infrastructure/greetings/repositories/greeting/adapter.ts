/**
 * Sequelize Implementation of GreetingRepositoryPort
 */

import { injectable } from "tsyringe";
import type { GreetingRepositoryPort } from "./port";
import type {
  Greeting,
  CreateGreetingInput,
} from "../../../../domain/models/greeting";
import { GreetingModel } from "../../../models/greeting.model";

@injectable()
export class GreetingRepositoryAdapter implements GreetingRepositoryPort {
  private toDomain(model: GreetingModel): Greeting {
    return {
      id: model.id.toString(),
      message: model.message,
      language: model.language,
      createdAt: model.createdAt,
    };
  }

  async findById(id: string): Promise<Greeting | null> {
    const model = await GreetingModel.findByPk(id);
    return model ? this.toDomain(model) : null;
  }

  async findAll(filter?: { language?: string }): Promise<Greeting[]> {
    const where = filter?.language ? { language: filter.language } : {};
    const models = await GreetingModel.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    return models.map((model) => this.toDomain(model));
  }

  async create(input: CreateGreetingInput): Promise<Greeting> {
    const model = await GreetingModel.create({
      message: input.message,
      language: input.language,
    });
    return this.toDomain(model);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await GreetingModel.destroy({ where: { id } });
    return deleted > 0;
  }
}
