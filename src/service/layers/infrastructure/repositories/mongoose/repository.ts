import type { QueryFilter } from '@zacatl/third-party/mongoose';

import type { MongooseRepositoryConfig, MongooseRepositoryModel } from './types';
import { createMongooseAdapter } from '../../orm';
import type { RepositoryPort, ORMPort } from '../types';

/**
 * Standalone Mongoose Repository - delegates to MongooseAdapter
 *
 * Provides all repository operations for Mongoose ORM without runtime adapter switching.
 * Internally uses the same MongooseAdapter as BaseRepository for code reuse.
 */
export abstract class AbstractMongooseRepository<D, I extends object, O extends object>
  implements RepositoryPort<MongooseRepositoryModel<D>, I, O, QueryFilter<D>>
{
  public get model(): MongooseRepositoryModel<D> {
    return this.adapter.model;
  }

  private readonly adapter: ORMPort<MongooseRepositoryModel<D>, I, O, QueryFilter<D>>;

  constructor(config: MongooseRepositoryConfig<D>) {
    this.adapter = createMongooseAdapter<D, I, O>(config);
  }

  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
  }

  async findMany(filter: QueryFilter<D> = {}): Promise<O[]> {
    return this.adapter.findMany(filter);
  }

  async create(entity: I): Promise<O> {
    return this.adapter.create(entity);
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.adapter.update(id, update);
  }

  async delete(id: string): Promise<O | null> {
    return this.adapter.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.adapter.exists(id);
  }

  public toLean(input: unknown): O | null {
    return this.adapter.toLean(input);
  }
}
