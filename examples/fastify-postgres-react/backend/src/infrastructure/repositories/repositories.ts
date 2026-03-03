import type { InfrastructureRepository } from '@sentzunhat/zacatl/service';
import { GreetingRepositoryAdapter } from './greeting/adapter';

export const repositories = [GreetingRepositoryAdapter] as unknown as InfrastructureRepository[];
