import { readFileSync } from 'fs';

import { describe, it, expect } from 'vitest';

describe('adapter-loader lazy behavior', () => {
  it('does not statically import SequelizeAdapter', () => {
    const src = readFileSync(
      'src/service/layers/infrastructure/orm/sequelize/adapter-loader.ts',
      'utf8',
    );

    expect(src).not.toContain('import { SequelizeAdapter');
  });

  it('does not statically import MongooseAdapter', () => {
    const src = readFileSync(
      'src/service/layers/infrastructure/orm/mongoose/adapter-loader.ts',
      'utf8',
    );

    expect(src).not.toContain('import { MongooseAdapter');
  });
});
