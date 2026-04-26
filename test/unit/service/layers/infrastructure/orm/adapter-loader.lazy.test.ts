import { readFile } from 'node:fs/promises';

import { describe, it, expect } from 'vitest';

const readSource = (relativePath: string): Promise<string> =>
  readFile(new URL(relativePath, import.meta.url), 'utf8');

describe('adapter factories', () => {
  it('instantiate the Sequelize adapter directly', async () => {
    const source = await readSource(
      '../../../../../../src/service/layers/infrastructure/orm/sequelize/adapter-loader.ts',
    );

    expect(source).toContain('new SequelizeAdapter');
    expect(source).not.toContain('import(');
  });

  it('instantiate the Mongoose adapter directly', async () => {
    const source = await readSource(
      '../../../../../../src/service/layers/infrastructure/orm/mongoose/adapter-loader.ts',
    );

    expect(source).toContain('new MongooseAdapter');
    expect(source).not.toContain('import(');
  });
});
