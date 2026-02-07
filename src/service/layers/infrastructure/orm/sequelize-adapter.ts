import {
  SequelizeModel as Model,
  ModelStatic,
} from "../../../../third-party/sequelize";
import type { SequelizeRepositoryConfig, ORMPort } from "../repositories/types";

/**
 * SequelizeAdapter - Handles Sequelize-specific ORM operations
 */
export class SequelizeAdapter<D extends Model, I, O> implements ORMPort<
  D,
  I,
  O
> {
  public readonly model: ModelStatic<D>;

  constructor(config: SequelizeRepositoryConfig<D>) {
    this.model = config.model;
  }

  public toLean(input: unknown): O | null {
    if (!input) return null;
    const plain =
      input instanceof Model ? input.get({ plain: true }) : (input as O);

    // Normalize id, createdAt, updatedAt
    return {
      ...(plain as O),
      id: String((plain as any).id || (plain as any)._id || ""),
      createdAt: (plain as any).createdAt
        ? new Date((plain as any).createdAt)
        : new Date(),
      updatedAt: (plain as any).updatedAt
        ? new Date((plain as any).updatedAt)
        : new Date(),
    } as O;
  }

  async findById(id: string): Promise<O | null> {
    const entity = await this.model.findByPk(id);
    return this.toLean(entity);
  }

  async create(entity: I): Promise<O> {
    const document = await this.model.create(entity as any);
    return this.toLean(document) as O;
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    const [affectedCount] = await this.model.update(update as any, {
      where: { id } as any,
    });

    if (affectedCount === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<O | null> {
    const entity = await this.findById(id);
    if (!entity) return null;

    await this.model.destroy({
      where: { id } as any,
    });

    return entity;
  }
}
