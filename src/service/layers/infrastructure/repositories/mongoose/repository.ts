import type {
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
} from "./types";
import { createMongooseAdapter } from "../../orm/adapter-loader";
import type { RepositoryPort , ORMPort } from "../types";

/**
 * Standalone Mongoose Repository - delegates to MongooseAdapter
 *
 * Provides all repository operations for Mongoose ORM without runtime adapter switching.
 * Internally uses the same MongooseAdapter as BaseRepository for code reuse.
 */
export abstract class AbstractMongooseRepository<
  D,
  I,
  O,
> implements RepositoryPort<MongooseRepositoryModel<D>, I, O> {
  private readonly adapter: ORMPort<MongooseRepositoryModel<D>, I, O>;

  constructor(config: MongooseRepositoryConfig<D>) {
    this.adapter = createMongooseAdapter<D, I, O>(config);
  }

  /** ORM model instance - delegated to adapter */
  public get model(): MongooseRepositoryModel<D> {
    return this.adapter.model;
  }

  /**
   * Convert Mongoose document to lean output with normalized id, createdAt, updatedAt
   */
  public toLean(input: unknown): O | null {
    return this.adapter.toLean(input);
  }

  /**
   * Find document by id and return lean output
   */
  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
  }

  /**
   * Find documents matching filter and return lean output
   */
  async findMany(filter: Record<string, unknown> = {}): Promise<O[]> {
    return this.adapter.findMany(filter);
  }

  /**
   * Create new document from input and return lean output
   */
  async create(entity: I): Promise<O> {
    return this.adapter.create(entity);
  }

  /**
   * Update document by id with partial input and return new lean state
   */
  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.adapter.update(id, update);
  }

  /**
   * Delete document by id and return last lean state before deletion
   */
  async delete(id: string): Promise<O | null> {
    return this.adapter.delete(id);
  }

  /**
   * Check if document with id exists
   */
  async exists(id: string): Promise<boolean> {
    return this.adapter.exists(id);
  }
}
