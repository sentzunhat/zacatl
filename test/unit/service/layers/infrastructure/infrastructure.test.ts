import { container } from 'tsyringe';
import {
  ConfigInfrastructure,
  Infrastructure,
} from '../../../../../src/service/layers/infrastructure';
import type { RepositoryPort } from '../../../../../src/service/layers/infrastructure/types';
import type { RepositoryModel } from '../../../../../src/service/layers/infrastructure/repositories/types';

class DummyRepository implements RepositoryPort<object> {
  public model = {} as RepositoryModel<object>;

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

const config: ConfigInfrastructure = {
  repositories: [DummyRepository],
};

describe('Infrastructure', () => {
  let infrastructure: Infrastructure;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('start() method exists for interface compatibility', () => {
    infrastructure = new Infrastructure(config);

    // start() should exist and not throw
    expect(() => infrastructure.start()).not.toThrow();
  });
});
