import { SequelizeModel as Model } from "../../../../third-party/sequelize";
import type {
  SequelizeRepositoryConfig,
  SequelizeRepositoryModel,
  ORMPort,
} from "../repositories/types";

/**
 * Sequelize ORM adapter - handles Sequelize-specific database operations
 */
export class SequelizeAdapter<D extends object, I, O> implements ORMPort<
  SequelizeRepositoryModel<D>,
  I,
  O
> {
  public readonly model: SequelizeRepositoryModel<D>;

  constructor(config: SequelizeRepositoryConfig<D>) {
    this.model = config.model;
  }

  public toLean(input: unknown): O | null {
    if (input == null) return null;

    const plain =
      input instanceof Model
        ? (input.get({ plain: true }) as Record<string, unknown>)
        : (input as Record<string, unknown>);

    const idValue = plain["id"] ?? plain["_id"];
    const createdAtValue = plain["createdAt"];
    const updatedAtValue = plain["updatedAt"];

    // Normalize id, createdAt, updatedAt
    return {
      ...(plain as O),
      id: idValue !== undefined && idValue !== null ? String(idValue) : "",
      createdAt:
        createdAtValue != null ? new Date(createdAtValue as string | number | Date) : new Date(),
      updatedAt:
        updatedAtValue != null ? new Date(updatedAtValue as string | number | Date) : new Date(),
    } as O;
  }

  async findById(id: string): Promise<O | null> {
    const entity = await this.model.findByPk(id);
    return this.toLean(entity);
  }

  async findMany(filter: Record<string, unknown> = {}): Promise<O[]> {
    const entities = await this.model.findAll({
      where: filter as never,
    });

    return entities
      .map((entity) => this.toLean(entity))
      .filter((entity): entity is O => entity != null);
  }

  async create(entity: I): Promise<O> {
    const document = await this.model.create(entity as never);
    return this.toLean(document) as O;
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    const [affectedCount] = await this.model.update(update as never, {
      where: { id } as never,
    });

    if (affectedCount === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<O | null> {
    const entity = await this.findById(id);
    if (entity == null) return null;

    await this.model.destroy({
      where: { id } as never,
    });

    return entity;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id } as never,
    });
    return (Array.isArray(count) ? count.length : count) > 0;
  }
}
