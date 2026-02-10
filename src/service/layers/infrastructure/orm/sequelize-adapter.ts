import {
  SequelizeModel as Model,
  ModelStatic,
} from "../../../../third-party/sequelize";
import type { SequelizeRepositoryConfig, ORMPort } from "../repositories/types";

/**
 * Sequelize ORM adapter - handles Sequelize-specific database operations
 */
export class SequelizeAdapter<D, I, O> implements ORMPort<D, I, O> {
  public readonly model: ModelStatic<Model>;

  constructor(config: SequelizeRepositoryConfig<object>) {
    this.model = config.model;
  }

  public toLean(input: unknown): O | null {
    if (!input) return null;

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
      createdAt: createdAtValue
        ? new Date(createdAtValue as string | number | Date)
        : new Date(),
      updatedAt: updatedAtValue
        ? new Date(updatedAtValue as string | number | Date)
        : new Date(),
    } as O;
  }

  async findById(id: string): Promise<O | null> {
    const entity = await this.model.findByPk(id);
    return this.toLean(entity);
  }

  async findMany(filter: Record<string, unknown> = {}): Promise<O[]> {
    const entities = await this.model.findAll({
      where: filter as Record<string, unknown>,
    });

    return entities
      .map((entity) => this.toLean(entity))
      .filter((entity): entity is O => Boolean(entity));
  }

  async create(entity: I): Promise<O> {
    const document = await this.model.create(
      entity as unknown as Record<string, unknown>,
    );
    return this.toLean(document) as O;
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    const [affectedCount] = await this.model.update(
      update as unknown as Record<string, unknown>,
      {
        where: { id } as Record<string, unknown>,
      },
    );

    if (affectedCount === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<O | null> {
    const entity = await this.findById(id);
    if (!entity) return null;

    await this.model.destroy({
      where: { id } as Record<string, unknown>,
    });

    return entity;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id } as Record<string, unknown>,
    });
    return count > 0;
  }
}
