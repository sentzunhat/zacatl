import { container } from '@zacatl/third-party/dependency-injection/tsyringe';

import { clearContainer } from '../../../../../src/dependency-injection/container';
import type { InfrastructureConfig } from '../../../../../src/service/layers/infrastructure/types';
import { Infrastructure } from '../../../../../src/service/layers/infrastructure/infrastructure';
import type { RepositoryModel } from '../../../../../src/service/layers/infrastructure/repositories/types';
import type { RepositoryPort } from '../../../../../src/service/layers/infrastructure/types';

class DummyRepository implements RepositoryPort<object> {
  public model = {} as RepositoryModel<object>;

  async ready(): Promise<void> {}

  public toLean(input: object): object | null {
    return input ? (input as object) : null;
  }

  async findById(_id: string): Promise<object | null> {
    return null;
  }

  async findMany(_filter?: Record<string, unknown>): Promise<object[]> {
    return [];
  }

  async create(_data: Partial<object>): Promise<object> {
    return {};
  }

  async update(_id: string, _data: Partial<object>): Promise<object | null> {
    return null;
  }

  async delete(_id: string): Promise<object | null> {
    return null;
  }

  async exists(_id: string): Promise<boolean> {
    return false;
  }
}

const config: InfrastructureConfig = {
  repositories: [DummyRepository],
};

describe('Infrastructure', () => {
  let infrastructure: Infrastructure;

  beforeEach(() => {
    clearContainer();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearContainer();
  });

  it('should store the configuration passed in the constructor', () => {
    infrastructure = new Infrastructure(config);
    expect(infrastructure['config']).toEqual(config);
  });

  it('should register dependencies on construction (new pattern)', () => {
    const registerSpy = vi.spyOn(container, 'register');

    new Infrastructure({
      repositories: [DummyRepository],
    });

    expect(registerSpy).toHaveBeenCalledWith(
      DummyRepository,
      { useClass: DummyRepository },
      { lifecycle: 1 },
    );
  });

  it('start() awaits repository readiness', async () => {
    infrastructure = new Infrastructure(config);

    await expect(infrastructure.start()).resolves.toBeUndefined();
  });

  it('start() propagates repository readiness failures', async () => {
    class FailingRepository extends DummyRepository {
      override async ready(): Promise<void> {
        throw new Error('repo-ready-failure');
      }
    }

    const failingInfrastructure = new Infrastructure({
      repositories: [FailingRepository],
    });

    await expect(failingInfrastructure.start()).rejects.toThrow('repo-ready-failure');
  });
});
