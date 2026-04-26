import { describe, it, expect } from 'vitest';

import { isUnderPrefix } from '../../../../../../../src/service/platforms/server/shared/prefixes/is-under-prefix';

describe('isUnderPrefix', () => {
  it('matches the prefix itself and paths under it', () => {
    expect(isUnderPrefix('/api', '/api')).toBe(true);
    expect(isUnderPrefix('/api/users', '/api')).toBe(true);
    expect(isUnderPrefix('/api?x=1', '/api')).toBe(true);
  });

  it('does not match sibling paths sharing the prefix as a substring', () => {
    expect(isUnderPrefix('/apifoo', '/api')).toBe(false);
  });

  it('normalizes the prefix before matching', () => {
    expect(isUnderPrefix('/api/users', 'api')).toBe(true);
    expect(isUnderPrefix('/api/users', '/api/')).toBe(true);
  });

  it('never matches when the prefix normalizes to no prefix', () => {
    expect(isUnderPrefix('/anything', '')).toBe(false);
    expect(isUnderPrefix('/anything', '/')).toBe(false);
  });
});
