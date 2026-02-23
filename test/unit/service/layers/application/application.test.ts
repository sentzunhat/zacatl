import { describe, it, expect, vi } from 'vitest';
import type { FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { Application } from '../../../../../src/service/layers/application';
import type {
  ConfigApplication,
  HookHandler,
  HookHandlerName,
} from '../../../../../src/service/layers/application';
import { AbstractRouteHandler } from '../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/abstract';
import type { Request } from '../../../../../src/service/layers/application/entry-points/rest/common/request';

class DummyHookHandler implements HookHandler {
  public name: HookHandlerName = 'onRequest';

  async execute(_: FastifyRequest): Promise<void> {}
}

class DummyRouteHandler extends AbstractRouteHandler {
  constructor() {
    super({
      url: '/',
      schema: {},
      method: 'GET',
    });
  }

  async handler(_: Request): Promise<void> {
    // Dummy implementation
  }
}

const fakeConfig: ConfigApplication = {
  entryPoints: {
    rest: {
      hooks: [DummyHookHandler],
      routes: [DummyRouteHandler],
    },
  },
};

describe('Application', () => {
  it('should register hook and route handlers on construction (new pattern)', () => {
    const registerSpy = vi.spyOn(container, 'register');

    new Application(fakeConfig);

    // Should have registered both hooks and routes
    expect(registerSpy).toHaveBeenCalledWith(
      DummyHookHandler,
      { useClass: DummyHookHandler },
      { lifecycle: 1 },
    );
    expect(registerSpy).toHaveBeenCalledWith(
      DummyRouteHandler,
      { useClass: DummyRouteHandler },
      { lifecycle: 1 },
    );
  });
});
