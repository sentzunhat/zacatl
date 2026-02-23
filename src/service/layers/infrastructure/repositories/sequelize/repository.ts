import type {
  SequelizeRepositoryConfig,
  SequelizeRepositoryModel,
} from "./types";
import { createSequelizeAdapter } from "../../orm/adapter-loader";
import type { RepositoryPort , ORMPort } from "../types";

/**
 * Standalone Sequelize Repository - delegates to SequelizeAdapter
 *
 * Provides all repository operations for Sequelize ORM without runtime adapter switching.
 * Internally uses the same SequelizeAdapter as BaseRepository for code reuse.
 */
export abstract class AbstractSequelizeRepository<
  D extends object,
  I,
  O,
> implements RepositoryPort<SequelizeRepositoryModel<D>, I, O> {
  private readonly adapter: ORMPort<SequelizeRepositoryModel<D>, I, O>;

  constructor(config: SequelizeRepositoryConfig<D>) {
    this.adapter = createSequelizeAdapter<D, I, O>(config);
  }

  /** ORM model instance - delegated to adapter */
  public get model(): SequelizeRepositoryModel<D> {
    return this.adapter.model;
  }

  /**
   * Convert Sequelize model instance to lean output with normalized id, createdAt, updatedAt
   */
  public toLean(input: unknown): O | null {
    return this.adapter.toLean(input);
  }

  /**
   * Find record by id and return lean output
   */
  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
  }

  /**
   * Find records matching filter and return lean output
   */
  async findMany(filter: Record<string, unknown> = {}): Promise<O[]> {
    return this.adapter.findMany(filter);
  }

  /**
   * Create new record from input and return lean output
   */
  async create(entity: I): Promise<O> {
    return this.adapter.create(entity);
  }

  /**
   * Update record by id with partial input and return new lean state
   */
  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.adapter.update(id, update);
  }

  /**
   * Delete record by id and return last lean state before deletion
   */
  async delete(id: string): Promise<O | null> {
    return this.adapter.delete(id);
  }

  /**
   * Check if record with id exists
   */
  async exists(id: string): Promise<boolean> {
    return this.adapter.exists(id);
  }
}
