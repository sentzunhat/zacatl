import type { InfrastructureRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/types';
import { GreetingRepositoryAdapter } from './greeting/adapter';

export const repositories = [GreetingRepositoryAdapter] as unknown as InfrastructureRepository[];
