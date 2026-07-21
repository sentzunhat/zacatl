import type { WhereOptions } from '@zacatl/third-party/databases/sequelize';

import type { SequelizeRepositoryConfig, SequelizeRepositoryModel } from './types';
import { createSequelizeAdapter } from '../../orm/sequelize/adapter-loader';
import type { RepositoryPort, ORMPort, QueryOptions } from '../types';

/**
 * Standalone Sequelize Repository - delegates to SequelizeAdapter
 *
 * Provides all repository operations for Sequelize ORM without runtime adapter switching.
 * Internally uses the same SequelizeAdapter as BaseRepository for code reuse.
 */
export abstract class BaseRepository<
  D extends object,
  I extends object,
  O extends object,
> implements RepositoryPort<SequelizeRepositoryModel<D>, I, O, WhereOptions<D>>
{
  private readonly adapter: ORMPort<SequelizeRepositoryModel<D>, I, O, WhereOptions<D>>;

  constructor(config: SequelizeRepositoryConfig) {
    this.adapter = createSequelizeAdapter<D, I, O>(config);
  }

  public get model(): SequelizeRepositoryModel<D> {
    return this.adapter.model;
  }

  async ready(): Promise<void> {
    await this.adapter.ready();
  }

  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
  }

  async findMany(filter: WhereOptions<D> = {}, options?: QueryOptions): Promise<O[]> {
    return this.adapter.findMany(filter, options);
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
