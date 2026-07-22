import { getMongooseIndexModels } from './index-policy';
import { InternalServerError } from '../../../../../error';
import type { MongooseRepositoryModel } from '../../repositories/mongoose/types';

export interface MongooseIndexModelSelector {
  readonly models?: readonly string[];
  readonly collections?: readonly string[];
}

export interface MongooseIndexDiff {
  readonly database: 'MONGOOSE';
  readonly modelName: string;
  readonly collectionName: string;
  readonly mode: 'diff';
  readonly toCreate: readonly unknown[];
  readonly toDrop: readonly string[];
}

export interface MongooseIndexOperationResult {
  readonly database: 'MONGOOSE';
  readonly modelName: string;
  readonly collectionName: string;
  readonly operation: 'createIndexes' | 'syncIndexes';
  readonly status: 'completed';
  readonly toDrop?: readonly string[];
}

export interface MongooseIndexSyncOptions extends MongooseIndexModelSelector {
  readonly force?: boolean;
}

export class MongooseIndexManager {
  private readonly connectionName: string | undefined;
  private readonly models: readonly MongooseRepositoryModel<unknown>[] | undefined;

  constructor(options?: {
    readonly connectionName?: string;
    readonly models?: readonly MongooseRepositoryModel<unknown>[];
  }) {
    this.connectionName = options?.connectionName;
    this.models = options?.models;
  }

  async diff(selector?: MongooseIndexModelSelector): Promise<MongooseIndexDiff[]> {
    const models = this.selectModels(selector);
    const results: MongooseIndexDiff[] = [];

    for (const model of models) {
      const diff = await model.diffIndexes();
      results.push({
        database: 'MONGOOSE',
        modelName: model.modelName,
        collectionName: this.getCollectionName(model),
        mode: 'diff',
        toCreate: diff.toCreate,
        toDrop: diff.toDrop.map((indexName) => String(indexName)),
      });
    }

    return results;
  }

  async createMissing(
    selector?: MongooseIndexModelSelector,
  ): Promise<MongooseIndexOperationResult[]> {
    const models = this.selectModels(selector);
    const results: MongooseIndexOperationResult[] = [];

    for (const model of models) {
      await model.createIndexes();
      results.push({
        database: 'MONGOOSE',
        modelName: model.modelName,
        collectionName: this.getCollectionName(model),
        operation: 'createIndexes',
        status: 'completed',
      });
    }

    return results;
  }

  async syncIndexes(options: MongooseIndexSyncOptions): Promise<MongooseIndexOperationResult[]> {
    if (options.force !== true) {
      throw new InternalServerError({
        message: 'Mongoose index sync requires force: true',
        reason:
          'syncIndexes() may drop indexes that are not declared in the schema. ' +
          'Run diff() first and pass force: true only for an explicit operator action.',
        component: this.constructor.name,
        operation: 'syncIndexes',
      });
    }

    const models = this.selectModels(options);
    const results: MongooseIndexOperationResult[] = [];

    for (const model of models) {
      const toDrop = await model.syncIndexes();
      results.push({
        database: 'MONGOOSE',
        modelName: model.modelName,
        collectionName: this.getCollectionName(model),
        operation: 'syncIndexes',
        status: 'completed',
        toDrop: toDrop.map((indexName) => String(indexName)),
      });
    }

    return results;
  }

  private selectModels(selector?: MongooseIndexModelSelector): MongooseRepositoryModel<unknown>[] {
    const models =
      this.models != null ? [...this.models] : getMongooseIndexModels(this.connectionName);
    const modelAllowlist = new Set(selector?.models ?? []);
    const collectionAllowlist = new Set(selector?.collections ?? []);
    const filterByModel = modelAllowlist.size > 0;
    const filterByCollection = collectionAllowlist.size > 0;

    return models.filter((model) => {
      const modelMatches = !filterByModel || modelAllowlist.has(model.modelName);
      const collectionMatches =
        !filterByCollection || collectionAllowlist.has(this.getCollectionName(model));

      return modelMatches && collectionMatches;
    });
  }

  private getCollectionName(model: MongooseRepositoryModel<unknown>): string {
    return model.collection.collectionName;
  }
}
