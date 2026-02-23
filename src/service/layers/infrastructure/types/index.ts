import type { Constructor } from "../../types";
import type { RepositoryPort as BaseRepositoryPort } from "../repositories/types";

export type RepositoryPort<
  M = unknown,
  I = unknown,
  O = unknown,
> = BaseRepositoryPort<M, I, O>;

export type InfrastructureUnknownRepository = RepositoryPort<
  unknown,
  unknown,
  unknown
>;

export type InfrastructureRepository =
  Constructor<InfrastructureUnknownRepository>;

/**
 * Infrastructure repositories that handle data persistence.
 * Repositories implement the repository pattern for data access.
 */
export type InfrastructureRepositories = Array<InfrastructureRepository>;

export interface ConfigInfrastructure {
  repositories?: InfrastructureRepositories;
}
