import type {
  NodeSqliteRepositoryConfig,
  NodeSqliteRepositoryModel,
  ORMPort,
} from '../../repositories/types';

/**
 * Creates a Node.js SQLite adapter using lazy-loading wrapper.
 *
 * The `adapter` module (and therefore the `node:sqlite` import) is NOT
 * imported at module load time. It is dynamically imported the first time
 * any async repository method is called, preventing `node:sqlite` from being
 * evaluated when consumers don't have a SQLite use-case.
 *
 * The constructor kicks off the dynamic import immediately so the adapter is
 * ready well before the first DB call in normal service startup flows.
 *
 * @param config Node.js SQLite repository configuration
 * @returns ORMPort lazy-loading implementation for node:sqlite
 */
export const createNodeSqliteAdapter = <I extends object, O extends object>(
  config: NodeSqliteRepositoryConfig,
): ORMPort<NodeSqliteRepositoryModel, I, O> => {
  type Inner = ORMPort<NodeSqliteRepositoryModel, I, O>;

  class LazyNodeSqliteAdapter implements Inner {
    private _inner: Inner | null = null;
    private _loading: Promise<void> | null = null;

    constructor(private readonly cfg: NodeSqliteRepositoryConfig) {
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
          this._inner = new mod.NodeSqliteAdapter<I, O>(this.cfg);
        } catch (err: unknown) {
          const e = err instanceof Error ? err : new Error(String(err));
          throw new Error(
            `Failed to load node:sqlite adapter. Ensure 'node:sqlite' is available (Node.js 24+). Original error: ${e.message}`,
          );
        }
      })();
      await this._loading;
    }

    private get inner(): Inner {
      if (this._inner == null) {
        throw new Error(
          'NodeSqliteAdapter is not yet loaded. Await any async repository method (findById, create, etc.) before accessing the adapter directly.',
        );
      }
      return this._inner;
    }

    public get model(): NodeSqliteRepositoryModel {
      return this.cfg.database;
    }

    public toLean(input: unknown): O | null {
      // toLean is synchronous, can be called before async init
      if (this._inner == null) return null;
      return this._inner.toLean(input);
    }

    public async findById(id: string): Promise<O | null> {
      await this.ensureLoaded();
      return this.inner.findById(id);
    }

    public async findMany(filter?: Record<string, unknown>): Promise<O[]> {
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

  return new LazyNodeSqliteAdapter(config);
};
