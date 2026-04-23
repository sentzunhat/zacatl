import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { ConfigServer } from '../../../../../../src/service/platforms/server';
import { PageServer } from '../../../../../../src/service/platforms/server/page/page-server';
import type {
  PageServerPort,
  StaticConfig,
} from '../../../../../../src/service/platforms/server/page/port';
import {
  ServerType,
  ServerVendor,
} from '../../../../../../src/service/platforms/server/types/server-config';

const makeConfig = (page?: ConfigServer['page']): ConfigServer => ({
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
      expect(adapter.registerSpaFallback).toHaveBeenCalledWith('/api', './dist/client');
    });

    it('should use configured apiPrefix for SPA fallback guard', async () => {
      pageServer = new PageServer(makeConfig({ staticDir: './dist', apiPrefix: '/v1' }), adapter);

      await pageServer.configure();

      expect(adapter.registerSpaFallback).toHaveBeenCalledWith('/v1', './dist');
    });

    it('should NOT pass apiPrefix as static file URL prefix', async () => {
      pageServer = new PageServer(makeConfig({ staticDir: './dist', apiPrefix: '/api' }), adapter);

      await pageServer.configure();

      const staticCall: StaticConfig = (adapter.registerStaticFiles as any).mock.calls[0][0];
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

    it('should invoke customRegister with the adapter', async () => {
      const customRegister = vi.fn().mockResolvedValue(undefined);
      pageServer = new PageServer(makeConfig({ staticDir: './dist', customRegister }), adapter);

      await pageServer.configure();

      expect(customRegister).toHaveBeenCalledWith(adapter);
    });

    it('should invoke customRegister even when staticDir is absent', async () => {
      const customRegister = vi.fn().mockResolvedValue(undefined);
      pageServer = new PageServer(makeConfig({ customRegister }), adapter);

      await pageServer.configure();

      expect(customRegister).toHaveBeenCalledWith(adapter);
    });
  });

  describe('registerStaticFiles()', () => {
    it('should delegate to adapter', () => {
      pageServer = new PageServer(makeConfig(), adapter);
      pageServer.registerStaticFiles({ root: '/dist' });

      expect(adapter.registerStaticFiles).toHaveBeenCalledWith({ root: '/dist' });
    });
  });

  describe('registerSpaFallback()', () => {
    it('should delegate to adapter', () => {
      pageServer = new PageServer(makeConfig(), adapter);
      pageServer.registerSpaFallback('/api', '/dist');

      expect(adapter.registerSpaFallback).toHaveBeenCalledWith('/api', '/dist');
    });
  });

  describe('getAdapter()', () => {
    it('should return the adapter', () => {
      pageServer = new PageServer(makeConfig(), adapter);

      expect(pageServer.getAdapter()).toBe(adapter);
    });
  });
});
