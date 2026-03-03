import { describe, it, expect } from 'vitest';

import {
  requestContext,
  requestContextMixin,
} from '../../../../../src/service/platforms/context/request-context';

describe('requestContext (AsyncLocalStorage)', () => {
  it('getStore() returns undefined outside a run() scope', () => {
    expect(requestContext.getStore()).toBeUndefined();
  });

  it('getStore() returns the active context within a run() scope', () =>
    new Promise<void>((resolve) => {
      requestContext.run({ requestId: 'req-1', tenantId: 't1' }, () => {
        expect(requestContext.getStore()).toEqual({ requestId: 'req-1', tenantId: 't1' });
        resolve();
      });
    }));

  it('contexts do not leak across run() scopes', () => {
    let innerStore: ReturnType<typeof requestContext.getStore>;

    requestContext.run({ requestId: 'scoped' }, () => {
      innerStore = requestContext.getStore();
    });

    // After the run() callback, we are back outside the scope
    expect(requestContext.getStore()).toBeUndefined();
    expect(innerStore).toEqual({ requestId: 'scoped' });
  });
});

describe('requestContextMixin()', () => {
  it('returns an empty object when no context is active', () => {
    expect(requestContextMixin()).toEqual({});
  });

  it('returns the active context store fields inside a run() scope', () =>
    new Promise<void>((resolve) => {
      requestContext.run({ requestId: 'abc', userId: 'u-42' }, () => {
        expect(requestContextMixin()).toEqual({ requestId: 'abc', userId: 'u-42' });
        resolve();
      });
    }));
});
