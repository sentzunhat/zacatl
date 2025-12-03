import { Model, ModelCtor } from "sequelize";
import { Repository, SequelizeRepositoryConfig, LeanDocument } from "./types";

export class SequelizeRepository<D extends Model, T>
  implements Repository<D, T>
{
  public readonly model: ModelCtor<D>;

  constructor(config: SequelizeRepositoryConfig<D>) {
    this.model = config.model;
  }

  public toLean(input: any): LeanDocument<T> | null {
    if (!input) return null;
    const plain = input instanceof Model ? input.get({ plain: true }) : input;

    // Ensure id, createdAt, updatedAt exist and are correct types
    // This assumes the model has these fields.
    return {
      ...(plain as T),
      id: String(plain.id || plain._id || ""),
      createdAt: plain.createdAt ? new Date(plain.createdAt) : new Date(),
      updatedAt: plain.updatedAt ? new Date(plain.updatedAt) : new Date(),
    } as LeanDocument<T>;
  }

  async findById(id: string): Promise<LeanDocument<T> | null> {
    const entity = await this.model.findByPk(id);
    return this.toLean(entity);
  }

  async create(entity: D): Promise<LeanDocument<T>> {
    const document = await this.model.create(entity as any);
    return this.toLean(document) as LeanDocument<T>;
  }

  async update(
    id: string,
    update: Partial<D>
  ): Promise<LeanDocument<T> | null> {
    const [affectedCount] = await this.model.update(update as any, {
      where: { id } as any,
    });

    if (affectedCount === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<LeanDocument<T> | null> {
    const entity = await this.findById(id);
    if (!entity) return null;

    await this.model.destroy({
      where: { id } as any,
    });

    return entity;
  }
}
[
  {
    type: "image",
    payload: {
      attachment_id: "{{ $json.propertyName }}",
    },
  },
];
