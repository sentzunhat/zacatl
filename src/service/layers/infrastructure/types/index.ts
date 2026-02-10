import type { Constructor } from "../../types";
import type { RepositoryPort as BaseRepositoryPort } from "../repositories/types";

export type RepositoryPort<
  D = unknown,
  I = unknown,
  O = unknown,
> = BaseRepositoryPort<D, I, O>;

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

export type ConfigInfrastructure = {
  repositories?: InfrastructureRepositories;
};
