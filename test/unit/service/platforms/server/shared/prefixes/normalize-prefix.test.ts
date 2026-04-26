import { describe, it, expect } from 'vitest';

import { normalizePrefix } from '../../../../../../../src/service/platforms/server/shared/prefixes/normalize-prefix';

describe('normalizePrefix', () => {
  it('adds a leading slash when missing', () => {
    expect(normalizePrefix('api')).toBe('/api');
  });

  it('keeps an existing leading slash', () => {
    expect(normalizePrefix('/api')).toBe('/api');
  });

  it('strips a trailing slash', () => {
    expect(normalizePrefix('/api/')).toBe('/api');
  });

  it('treats empty string and root as no prefix', () => {
    expect(normalizePrefix('')).toBe('');
    expect(normalizePrefix('/')).toBe('');
  });
});
