import { MongooseAdapter } from './mongoose-adapter';
import type {
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
  SequelizeRepositoryConfig,
  SequelizeRepositoryModel,
  ORMPort,
} from '../repositories/types';

/**
 * Creates a Mongoose adapter
 * @param config Mongoose repository configuration
 * @returns ORMPort implementation for Mongoose
 */
export const createMongooseAdapter = <D, I, O>(
  config: MongooseRepositoryConfig<D>,
): ORMPort<MongooseRepositoryModel<D>, I, O> => {
  return new MongooseAdapter<D, I, O>(config);
};

/**
 * Creates a Sequelize adapter
 * @param config Sequelize repository configuration
 * @returns ORMPort implementation for Sequelize
 */
export const createSequelizeAdapter = <D extends object, I, O>(
  config: SequelizeRepositoryConfig<D>,
): ORMPort<SequelizeRepositoryModel<D>, I, O> => {
  // Lazy wrapper that defers importing the real Sequelize adapter until
  // the adapter is actually used. This keeps bundlers from traversing the
  // Sequelize implementation and its heavy runtime deps when unused.
  class LazySequelizeAdapter implements ORMPort<SequelizeRepositoryModel<D>, I, O> {
    public readonly model: SequelizeRepositoryModel<D>;

    private loaded: Promise<ORMPort<SequelizeRepositoryModel<D>, I, O>> | null = null;

    constructor(private readonly cfg: SequelizeRepositoryConfig<D>) {
      this.model = cfg.model;
    }

    private async load(): Promise<ORMPort<SequelizeRepositoryModel<D>, I, O>> {
      if (this.loaded) return this.loaded;
      this.loaded = (async () => {
        try {
          const mod = await import('./sequelize-adapter');
          return new mod.SequelizeAdapter<D, I, O>(this.cfg) as ORMPort<
            SequelizeRepositoryModel<D>,
            I,
            O
          >;
        } catch (err) {
          const e = err instanceof Error ? err : new Error(String(err));
          throw new Error(
            `Failed to load Sequelize adapter. Ensure optional dependency 'sequelize' and its dialect packages are installed. Original error: ${e.message}`,
          );
        }
      })();

      return this.loaded;
    }

    public toLean(input: unknown): O | null {
      if (input == null) return null;

      const plain =
        // If the Sequelize instance shape is present, prefer its `get` method
        typeof (input as any)?.get === 'function'
          ? (input as any).get({ plain: true })
          : (input as Record<string, unknown>);

      const idValue =
        (plain as Record<string, unknown>)['id'] ?? (plain as Record<string, unknown>)['_id'];
      const createdAtValue = (plain as Record<string, unknown>)['createdAt'];
      const updatedAtValue = (plain as Record<string, unknown>)['updatedAt'];

      return {
        ...(plain as O),
        id: idValue !== undefined && idValue !== null ? String(idValue) : '',
        createdAt:
          createdAtValue != null ? new Date(createdAtValue as string | number | Date) : new Date(),
        updatedAt:
          updatedAtValue != null ? new Date(updatedAtValue as string | number | Date) : new Date(),
      } as O;
    }

    public async findById(id: string): Promise<O | null> {
      const real = await this.load();
      return real.findById(id);
    }

    public async findMany(filter: Record<string, unknown> = {}): Promise<O[]> {
      const real = await this.load();
      return real.findMany(filter);
    }

    public async create(entity: I): Promise<O> {
      const real = await this.load();
      return real.create(entity);
    }

    public async update(id: string, update: Partial<I>): Promise<O | null> {
      const real = await this.load();
      return real.update(id, update);
    }

    public async delete(id: string): Promise<O | null> {
      const real = await this.load();
      return real.delete(id);
    }

    public async exists(id: string): Promise<boolean> {
      const real = await this.load();
      return real.exists(id);
    }
  }

  return new LazySequelizeAdapter(config) as unknown as ORMPort<SequelizeRepositoryModel<D>, I, O>;
};
