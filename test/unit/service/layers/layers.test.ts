import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  clearContainer,
  createChildContainer,
  getContainer,
  registerValue,
} from '../../../../src/dependency-injection';
import { Layers } from '../../../../src/service/layers/layers';
import { LayersConfigToken } from '../../../../src/service/layers/tokens';
import type { LayersConfig } from '../../../../src/service/layers/types';
import {
  ServiceContainerToken,
} from '../../../../src/service/tokens';

beforeEach(() => {
  clearContainer();
});

describe('Layers', () => {
  it('constructs with an empty config without throwing', () => {
    expect(() => new Layers({})).not.toThrow();
  });

  it('keeps standalone scope registrations out of the global container', () => {
    const layers = new Layers({});

    expect('getApplicationContainer' in layers).toBe(false);
    expect(getContainer().isRegistered(ServiceContainerToken, false)).toBe(false);
  });

  it('preserves direct construction with a Service container by deriving layer scopes', () => {
    const serviceContainer = createChildContainer(getContainer());

    expect(() => new Layers({}, serviceContainer)).not.toThrow();
    expect(serviceContainer.resolve(ServiceContainerToken)).toBe(serviceContainer);
  });

  it('fails DI resolution when the Service-managed layer scopes are missing', () => {
    const container = createChildContainer(getContainer());
    registerValue(LayersConfigToken, {}, container);
    registerValue(ServiceContainerToken, createChildContainer(container), container);

    expect(() => container.resolve(Layers)).toThrow(/service\/layers\/container-scopes/);
  });

  it('constructs with infrastructure config', () => {
    expect(() => new Layers({ infrastructure: { repositories: [] } })).not.toThrow();
  });

  it('constructs with domain config', () => {
    expect(() => new Layers({ domain: { providers: [], services: [] } })).not.toThrow();
  });

  it('constructs with application config', () => {
    const config: LayersConfig = {
      application: { entryPoints: { rest: { routes: [], hooks: [] } } },
    };
    expect(() => new Layers(config)).not.toThrow();
  });

  it('start() resolves when infrastructure is undefined', async () => {
    const layers = new Layers({});
    await expect(layers.start()).resolves.toBeUndefined();
  });

  it('start() awaits infrastructure start when present', async () => {
    const layers = new Layers({ infrastructure: { repositories: [] } });
    // infrastructure.start() resolves when repositories list is empty
    await expect(layers.start()).resolves.toBeUndefined();
  });

  it('start() propagates infrastructure start failures', async () => {
    const layers = new Layers({ infrastructure: { repositories: [] } });

    // Inject a failing infrastructure stub
    const stub = { start: vi.fn().mockRejectedValue(new Error('infra-fail')) };
    (layers as unknown as { infrastructure: typeof stub }).infrastructure = stub;

    await expect(layers.start()).rejects.toThrow('infra-fail');
  });
});
