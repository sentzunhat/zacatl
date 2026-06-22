import type { Sequelize, WhereOptions } from '@zacatl/third-party/databases/sequelize';
import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import { getContainer, resolveDependency } from '../../../../../dependency-injection';
import { InternalServerError } from '../../../../../error';
import type {
  SequelizeRepositoryConfig,
  SequelizeRepositoryModel,
  ORMPort,
} from '../../repositories/types';
import { SequelizeToken } from '../tokens';

/**
 * Sequelize ORM adapter - handles Sequelize-specific database operations
 */
export class SequelizeAdapter<D extends object, I extends object, O extends object>
  implements ORMPort<SequelizeRepositoryModel<D>, I, O, WhereOptions<D>>
{
  public readonly model: SequelizeRepositoryModel<D>;
  private readonly config: SequelizeRepositoryConfig<D>;

  constructor(config: SequelizeRepositoryConfig<D>) {
    this.config = config;
    this.model = this.resolveModel();

    void this.initialize().catch(console.error);
  }

  private resolveModel(): SequelizeRepositoryModel<D> {
    const token = SequelizeToken as InjectionToken<Sequelize>;

    if (!getContainer().isRegistered(token)) {
      throw new InternalServerError({
        message: 'Sequelize instance not registered in DI container',
        reason:
          'SequelizeToken has not been bound to a Sequelize instance. ' +
          'Ensure registerOrmInstance is called with DatabaseVendor.SEQUELIZE before using repositories.',
        component: this.constructor.name,
        operation: 'resolveModel',
      });
    }

    const sequelize = resolveDependency<Sequelize>(token);

    if (sequelize == null) {
      throw new InternalServerError({
        message: 'Sequelize instance resolved to null from DI container',
        reason:
          'SequelizeToken resolved to a null value. ' +
          'Ensure registerOrmInstance is called with a valid Sequelize instance.',
        component: this.constructor.name,
        operation: 'resolveModel',
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

  async findMany(filter: WhereOptions<D> = {}): Promise<O[]> {
    const entities = await this.model.findAll({
      where: filter,
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

  async update(id: string, update: Partial<I>): Promise<O | null> {
    const [affectedCount] = await this.model.update(update as never, {
      where: { id } as never,
    });

    if (affectedCount === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<O | null> {
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
