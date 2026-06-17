import type { LeanDocument } from '../types';

export type { LeanDocument } from '../types';

export type NodeSqliteLean<T extends object = Record<string, unknown>> = LeanDocument<T>;

export type NodeSqliteLeanDocument<T extends object = Record<string, unknown>> = LeanDocument<T>;

export type WithNodeSqliteMeta<T extends object> = LeanDocument<T>;
