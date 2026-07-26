import type { RepositoryPort, ORMPort, QueryOptions } from './types';

/**
 * Generic base repository implementation - shared by all ORM drivers.
 *
 * This abstract class provides common repository delegation logic, while
 * each driver (Mongoose, Sequelize, node:sqlite) provides type parameters
 * and adapter initialization in their own subclass.
 *
 * @typeParam ModelType - The ORM model type (e.g., MongooseModel<D>, ModelStatic<Model<D>>, DatabaseSync)
 * @typeParam InputType - The input data type for create/update operations
 * @typeParam OutputType - The output data type returned from operations
 * @typeParam FilterType - The filter/query type for the ORM (e.g., QueryFilter<D>, WhereOptions<D>)
 */
export abstract class BaseRepository<
  ModelType,
  InputType extends object,
  OutputType extends object,
  FilterType = Record<string, unknown>,
> implements RepositoryPort<ModelType, InputType, OutputType, FilterType>
{
  private readonly adapter: ORMPort<ModelType, InputType, OutputType, FilterType>;

  /**
   * Initialize the repository with an ORM adapter.
   *
   * @param adapter - The ORM adapter (Mongoose, Sequelize, or node:sqlite)
   */
  protected constructor(adapter: ORMPort<ModelType, InputType, OutputType, FilterType>) {
    this.adapter = adapter;
  }

  public get model(): ModelType {
    return this.adapter.model;
  }

  async ready(): Promise<void> {
    await this.adapter.ready();
  }

  async findById(id: string): Promise<OutputType | null> {
    return this.adapter.findById(id);
  }

  async findMany(filter?: FilterType, options?: QueryOptions): Promise<OutputType[]> {
    return this.adapter.findMany(filter, options);
  }

  async create(entity: InputType): Promise<OutputType> {
    return this.adapter.create(entity);
  }

  async update(
    id: string,
    update: Partial<InputType>,
    options?: {
      raw?: boolean;
    },
  ): Promise<OutputType | null> {
    return this.adapter.update(id, update, options);
  }

  async delete(id: string): Promise<OutputType | null> {
    return this.adapter.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.adapter.exists(id);
  }

  public toLean(input: unknown): OutputType | null {
    return this.adapter.toLean(input);
  }
}
