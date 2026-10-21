import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createChildContainer, getContainer, registerValue } from '../../../../../../src/third-party/dependency-injection/container';
import type { ServerConfig } from '../../../../../../src/service/platforms/server/server';
import { PageServer } from '../../../../../../src/service/platforms/server/page/page-server';
import type {
  PageServerPort,
  StaticConfig,
} from '../../../../../../src/service/platforms/server/page/port';
import {
  type PageRegistrationContext,
  ServerType,
  ServerVendor,
} from '../../../../../../src/service/platforms/server/types/server-config';

const makeConfig = (page?: ServerConfig['page']): ServerConfig => ({
  name: 'TestService',
  port: 3000,
  server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: {} },
  databases: [],
  ...(page !== undefined ? { page } : {}),
});

describe('PageServer', () => {
  let adapter: PageServerPort;
  let pageServer: PageServer;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = {
      registerStaticFiles: vi.fn(),
      registerSpaFallback: vi.fn(),
      register: vi.fn().mockResolvedValue(undefined),
      getRawServer: vi.fn().mockReturnValue({ native: true }),
    };
  });

  describe('configure()', () => {
    it('should do nothing when page config is absent', async () => {
      pageServer = new PageServer(makeConfig(), adapter);

      await pageServer.configure();

      expect(adapter.registerStaticFiles).not.toHaveBeenCalled();
      expect(adapter.registerSpaFallback).not.toHaveBeenCalled();
    });

    it('should serve static files from root and enable SPA fallback by default when staticDir is set', async () => {
      pageServer = new PageServer(makeConfig({ staticDir: './dist/client' }), adapter);

      await pageServer.configure();

      expect(adapter.registerStaticFiles).toHaveBeenCalledWith({ root: './dist/client' });
      expect(adapter.registerSpaFallback).toHaveBeenCalledWith({ api: '/api' }, './dist/client');
    });

    it('should use configured prefixes for SPA fallback guard', async () => {
      const config = makeConfig({ staticDir: './dist', prefixes: { api: '/v1' } });
      config.server.prefixes = { api: '/api' };
      pageServer = new PageServer(config, adapter);

      await pageServer.configure();

      expect(adapter.registerSpaFallback).toHaveBeenCalledWith({ api: '/v1' }, './dist');
    });

    it('inherits the Server API prefix for SPA fallback unless page prefixes override it', async () => {
      const config = makeConfig({ staticDir: './dist' });
      config.server.prefixes = { api: 'v1/' };
      pageServer = new PageServer(config, adapter);

      await pageServer.configure();

      expect(adapter.registerSpaFallback).toHaveBeenCalledWith({ api: 'v1/' }, './dist');
    });

    it('should NOT pass prefixes as static file URL prefix', async () => {
      pageServer = new PageServer(makeConfig({ staticDir: './dist', prefixes: { api: '/api' } }), adapter);

      await pageServer.configure();

      const registerStaticFilesMock = adapter.registerStaticFiles as unknown as {
        mock: { calls: unknown[][] };
      };
      const staticCall = registerStaticFilesMock.mock.calls[0]?.[0] as StaticConfig;
      expect(staticCall.prefix).toBeUndefined();
      expect(staticCall.root).toBe('./dist');
    });

    it('should skip SPA fallback when spaFallback is explicitly false', async () => {
      pageServer = new PageServer(
        makeConfig({ staticDir: './dist/client', spaFallback: false }),
        adapter,
      );

      await pageServer.configure();

      expect(adapter.registerStaticFiles).toHaveBeenCalledOnce();
      expect(adapter.registerSpaFallback).not.toHaveBeenCalled();
    });

    it('should skip static registration when staticDir is not set', async () => {
      pageServer = new PageServer(makeConfig({ customRegister: vi.fn() }), adapter);

      await pageServer.configure();

      expect(adapter.registerStaticFiles).not.toHaveBeenCalled();
      expect(adapter.registerSpaFallback).not.toHaveBeenCalled();
    });

    it('passes a scoped registration context that recognizes the configured API prefix', async () => {
      let isApiRequest: PageRegistrationContext['isApiRequest'] | undefined;
      const customRegister = vi.fn(({ isApiRequest: matchesApi }: PageRegistrationContext) => {
        isApiRequest = matchesApi;
      });
      const config = makeConfig({ staticDir: './dist', customRegister });
      config.server.prefixes = { api: 'v1/' };
      pageServer = new PageServer(config, adapter);

      await pageServer.configure();

      expect(customRegister).toHaveBeenCalledWith({
        adapter,
        rawServer: { native: true },
        isApiRequest: expect.any(Function),
        resolve: expect.any(Function),
      });
      expect(isApiRequest?.('/v1')).toBe(true);
      expect(isApiRequest?.('/v1/missing')).toBe(true);
      expect(isApiRequest?.('/v1?source=page')).toBe(true);
      expect(isApiRequest?.('/v10/missing')).toBe(false);
      expect(isApiRequest?.('/api/missing')).toBe(false);
    });

    it('should invoke customRegister even when staticDir is absent', async () => {
      const customRegister = vi.fn().mockResolvedValue(undefined);
      pageServer = new PageServer(makeConfig({ customRegister }), adapter);

      await pageServer.configure();

      expect(customRegister).toHaveBeenCalledWith({
        adapter,
        rawServer: { native: true },
        isApiRequest: expect.any(Function),
        resolve: expect.any(Function),
      });
      const context = customRegister.mock.calls[0]?.[0] as PageRegistrationContext;
      expect(context.isApiRequest('/api/missing')).toBe(false);
    });

    it('resolves custom registration dependencies from the supplied scope', async () => {
      const token = Symbol('page-provider');
      let resolved: unknown;
      const customRegister = vi.fn(({ resolve }) => { resolved = resolve(token); });
      const parentContainer = createChildContainer(getContainer());
      registerValue(token, 'service-owned', parentContainer);
      pageServer = new PageServer(makeConfig({ customRegister }), adapter, parentContainer);

      await pageServer.configure();

      expect(resolved).toBe('service-owned');
    });

    it('supports adapters without optional raw-server access', async () => {
      const adapterWithoutRawServer: PageServerPort = {
        registerStaticFiles: vi.fn(),
        registerSpaFallback: vi.fn(),
        register: vi.fn().mockResolvedValue(undefined),
      };
      const customRegister = vi.fn();
      pageServer = new PageServer(makeConfig({ customRegister }), adapterWithoutRawServer);

      await expect(pageServer.configure()).resolves.toBeUndefined();
      expect(customRegister).toHaveBeenCalledWith({
        adapter: adapterWithoutRawServer,
        rawServer: undefined,
        isApiRequest: expect.any(Function),
        resolve: expect.any(Function),
      });
    });
  });

  describe('registerStaticFiles()', () => {
    it('should delegate to adapter', () => {
      pageServer = new PageServer(makeConfig(), adapter);
      pageServer.registerStaticFiles({ root: '/dist' });

      expect(adapter.registerStaticFiles).toHaveBeenCalledWith({ root: '/dist' });
    });

    it('wraps adapter errors in CustomError', () => {
      (adapter.registerStaticFiles as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('fs-fail'); });
      pageServer = new PageServer(makeConfig(), adapter);

      expect(() => pageServer.registerStaticFiles({ root: '/dist' })).toThrow('failed to register static files');
    });
  });

  describe('registerSpaFallback()', () => {
    it('should delegate to adapter', () => {
      pageServer = new PageServer(makeConfig(), adapter);
      pageServer.registerSpaFallback({ api: '/api' }, '/dist');

      expect(adapter.registerSpaFallback).toHaveBeenCalledWith({ api: '/api' }, '/dist');
    });

    it('wraps adapter errors in CustomError', () => {
      (adapter.registerSpaFallback as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('spa-fail'); });
      pageServer = new PageServer(makeConfig(), adapter);

      expect(() => pageServer.registerSpaFallback({ api: '/api' }, '/dist')).toThrow('failed to register SPA fallback');
    });
  });

  describe('register()', () => {
    it('delegates to adapter register', async () => {
      pageServer = new PageServer(makeConfig(), adapter);
      await expect(pageServer.register()).resolves.toBeUndefined();
      expect(adapter.register).toHaveBeenCalledOnce();
    });

    it('wraps adapter register errors in CustomError', async () => {
      (adapter.register as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('reg-fail'));
      pageServer = new PageServer(makeConfig(), adapter);

      await expect(pageServer.register()).rejects.toThrow('failed to register page module');
    });
  });

  describe('getAdapter()', () => {
    it('should return the adapter', () => {
      pageServer = new PageServer(makeConfig(), adapter);

      expect(pageServer.getAdapter()).toBe(adapter);
    });
  });
});
