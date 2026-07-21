import type { Sequelize, WhereOptions } from '@zacatl/third-party/databases/sequelize';
import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import { getContainer, resolveDependency } from '../../../../../dependency-injection';
import { InternalServerError } from '../../../../../error';
import type {
  SequelizeRepositoryConfig,
  SequelizeRepositoryModel,
  ORMPort,
  QueryOptions,
} from '../../repositories/types';
import { DEFAULT_QUERY_LIMIT } from '../../repositories/types';
import { createDatabaseToken } from '../tokens/factory';

/**
 * Sequelize ORM adapter - handles Sequelize-specific database operations
 */
export class SequelizeAdapter<D extends object, I extends object, O extends object>
  implements ORMPort<SequelizeRepositoryModel<D>, I, O, WhereOptions<D>>
{
  // Resolved lazily on first use so that Service construction succeeds
  // even when the Sequelize instance is registered later in start().
  private _model: SequelizeRepositoryModel<D> | undefined;
  private _readyPromise: Promise<void> | undefined;
  private readonly config: SequelizeRepositoryConfig;

  constructor(config: SequelizeRepositoryConfig) {
    this.config = config;
  }

  // Satisfies ORMPort<SequelizeRepositoryModel<D>, ...>
  get model(): SequelizeRepositoryModel<D> {
    if (this._model === undefined) {
      this._model = this.resolveModel();
    }

    return this._model;
  }

  async ready(): Promise<void> {
    this.getOrCreateModel();

    if (this._readyPromise === undefined) {
      this._readyPromise = this.initialize();
    }

    await this._readyPromise;
  }

  private getOrCreateModel(): SequelizeRepositoryModel<D> {
    if (this._model === undefined) {
      this._model = this.resolveModel();
    }

    return this._model;
  }

  private resolveModel(): SequelizeRepositoryModel<D> {
    const connectionName = this.config.connection?.name ?? 'SEQUELIZE';
    const token = createDatabaseToken('SEQUELIZE', connectionName) as InjectionToken<Sequelize>;

    if (!getContainer().isRegistered(token)) {
      throw new InternalServerError({
        message: 'Sequelize instance not registered in DI container',
        reason:
          'Database token has not been bound to a Sequelize instance. ' +
          'Ensure registerOrmInstance is called with a valid Sequelize instance.',
        component: this.constructor.name,
        operation: 'resolveModel',
        metadata: { connectionName },
      });
    }

    const sequelize = resolveDependency<Sequelize>(token);

    if (sequelize == null) {
      throw new InternalServerError({
        message: 'Sequelize instance resolved to null from DI container',
        reason: 'Database token resolved to a null value.',
        component: this.constructor.name,
        operation: 'resolveModel',
        metadata: { connectionName },
      });
    }

    return sequelize.model(this.config.name);
  }

  private async initialize(): Promise<void> {
    // Hook for future use: sync, migrations, etc.
  }

  async findById(id: string): Promise<O | null> {
    const entity = await this.model.findByPk(id);
    return this.toLean(entity);
  }

  async findMany(filter: WhereOptions<D> = {}, options?: QueryOptions): Promise<O[]> {
    const limit = Math.max(0, Math.min(options?.limit ?? DEFAULT_QUERY_LIMIT, 1000));
    const offset = Math.max(0, options?.offset ?? 0);

    const entities = await this.model.findAll({
      where: filter,
      limit,
      offset,
    });

    return entities
      .map((entity) => this.toLean(entity))
      .filter((entity): entity is O => entity != null);
  }

  async create(entity: I): Promise<O> {
    const document = await this.model.create(entity as never);
    const lean = this.toLean(document);

    if (lean == null) {
      throw new InternalServerError({
        message: 'Failed to create record',
        reason: 'Document was created but toLean returned null',
        component: this.constructor.name,
        operation: 'create',
      });
    }

    return lean;
  }

  // Write operations scope by primary key `id` only — the shared adapter
  // contract across Mongoose/Sequelize/NodeSqlite. Consumers needing
  // composite/tenant scoping must enforce it in their repository layer.
  async update(id: string, update: Partial<I>): Promise<O | null> {
    // Postgres supports RETURNING, which saves the re-fetch round trip.
    if (this.model.sequelize?.getDialect() === 'postgres') {
      const [affectedCount, rows] = (await this.model.update(update as never, {
        where: { id } as never,
        returning: true,
      })) as unknown as [number, unknown[]];

      if (affectedCount === 0) return null;
      return this.toLean(rows?.[0] ?? null);
    }

    const [affectedCount] = await this.model.update(update as never, {
      where: { id } as never,
    });

    if (affectedCount === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<O | null> {
    // The pre-fetch is inherent to the contract: delete() returns the removed
    // entity, and SQL DELETE cannot return the row across all dialects.
    const entity = await this.findById(id);
    if (entity == null) return null;

    await this.model.destroy({
      where: { id } as never,
    });

    return entity;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id } as never,
    });
    return (Array.isArray(count) ? count.length : count) > 0;
  }

  public toLean(input: unknown): O | null {
    if (input == null) return null;

    interface WithGet {
      get?: (opts?: { plain?: boolean }) => unknown;
    }
    const maybeWithGet = input as unknown as WithGet | Record<string, unknown>;
    const plain =
      typeof maybeWithGet.get === 'function'
        ? maybeWithGet.get({ plain: true })
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
    };
  }
}
