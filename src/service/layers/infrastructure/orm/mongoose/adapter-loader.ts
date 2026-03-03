import type {
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
  ORMPort,
} from '../../repositories/types';

/**
 * Creates a Mongoose adapter using a lazy-loading wrapper.
 *
 * The `adapter` module (and therefore the `mongoose` npm package) is NOT
 * imported at module load time. It is dynamically imported the first time
 * any async repository method is called, preventing `mongoose` from being
 * evaluated when consumers import the main package entry without a MongoDB
 * use-case.
 *
 * The constructor kicks off the dynamic import immediately so the adapter is
 * ready well before the first DB call in normal service startup flows.
 *
 * @param config Mongoose repository configuration
 * @returns ORMPort lazy-loading implementation for Mongoose
 */
export const createMongooseAdapter = <D, I, O>(
  config: MongooseRepositoryConfig<D>,
): ORMPort<MongooseRepositoryModel<D>, I, O> => {
  type Inner = ORMPort<MongooseRepositoryModel<D>, I, O>;

  class LazyMongooseAdapter implements Inner {
    private _inner: Inner | null = null;
    private _loading: Promise<void> | null = null;

    constructor(private readonly cfg: MongooseRepositoryConfig<D>) {
      // Pre-start: begin loading immediately so the adapter is ready at first DB call
      void this.ensureLoaded();
    }

    private async ensureLoaded(): Promise<void> {
      if (this._inner != null) return;
      if (this._loading != null) {
        await this._loading;
        return;
      }
      this._loading = (async () => {
        try {
          const mod = await import('./adapter');
          this._inner = new mod.MongooseAdapter<D, I, O>(this.cfg);
        } catch (err: unknown) {
          const e = err instanceof Error ? err : new Error(String(err));
          throw new Error(
            `Failed to load Mongoose adapter. Ensure 'mongoose' is installed. Original error: ${e.message}`,
          );
        }
      })();
      await this._loading;
    }

    private get inner(): Inner {
      if (this._inner == null) {
        throw new Error(
          'MongooseAdapter is not yet loaded. Await any async repository method (findById, create, etc.) before accessing the adapter directly.',
        );
      }
      return this._inner;
    }

    public get model(): MongooseRepositoryModel<D> {
      return this.inner.model;
    }

    /**
     * Explicitly initialise the model: creates collection and indexes.
     * Duck-typed by BaseRepository.initializeModel() — must stay present.
     */
    public async initialize(): Promise<void> {
      await this.ensureLoaded();
      const withInit = this.inner as Inner & { initialize(): Promise<void> };
      await withInit.initialize();
    }

    public toLean(input: unknown): O | null {
      if (this._inner != null) return this._inner.toLean(input);
      return null;
    }

    public async findById(id: string): Promise<O | null> {
      await this.ensureLoaded();
      return this.inner.findById(id);
    }

    public async findMany(filter: Record<string, unknown> = {}): Promise<O[]> {
      await this.ensureLoaded();
      return this.inner.findMany(filter);
    }

    public async create(entity: I): Promise<O> {
      await this.ensureLoaded();
      return this.inner.create(entity);
    }

    public async update(id: string, update: Partial<I>): Promise<O | null> {
      await this.ensureLoaded();
      return this.inner.update(id, update);
    }

    public async delete(id: string): Promise<O | null> {
      await this.ensureLoaded();
      return this.inner.delete(id);
    }

    public async exists(id: string): Promise<boolean> {
      await this.ensureLoaded();
      return this.inner.exists(id);
    }
  }

  return new LazyMongooseAdapter(config) as unknown as ORMPort<MongooseRepositoryModel<D>, I, O>;
};
