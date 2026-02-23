import { readFileSync } from 'fs';

import { describe, it, expect } from 'vitest';

describe('sequelize-adapter imports', () => {
  it('uses type-only imports for third-party sequelize', () => {
    const src = readFileSync('src/service/layers/infrastructure/orm/sequelize-adapter.ts', 'utf8');

    // Ensure there is no runtime import that would pull in `sequelize` at bundle time
    expect(src).not.toMatch(/import\s+\{\s*SequelizeModel/);
    expect(src).toContain('import type');
  });
});
