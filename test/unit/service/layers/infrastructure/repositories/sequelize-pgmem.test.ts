import { newDb } from 'pg-mem';
import { describe, it, expect, beforeAll } from 'vitest';

import { Sequelize, DataTypes } from '@zacatl/third-party/sequelize';

describe('SequelizeRepository (pg-mem)', () => {
  let sequelize: Sequelize;
  let userModel: ReturnType<Sequelize['define']>;

  beforeAll(async () => {
    // Create an in-memory Postgres instance
    const db = newDb();
    const pg = db.adapters.createPg();

    // Create Sequelize instance using pg-mem's PG adapter
    sequelize = new Sequelize('postgres://user:password@localhost/db', {
      dialect: 'postgres',
      dialectModule: pg,
      logging: false,
    } as ConstructorParameters<typeof Sequelize>[1]);

    userModel = sequelize.define(
      'SequelizeUserPg',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: { type: DataTypes.DATE },
        updatedAt: { type: DataTypes.DATE },
      },
      { timestamps: true },
    );

    await sequelize.sync({ force: true });
  });

  it('creates and finds a record', async () => {
    const created = await userModel.create({ name: 'PgMemUser' });
    expect(created).toBeDefined();
    const found = await userModel.findByPk(created.get('id') as string);
    expect(found).not.toBeNull();
    expect(found?.get('name')).toBe('PgMemUser');
  });

  it('updates and deletes a record', async () => {
    const created = await userModel.create({ name: 'ToUpdate' });
    const id = created.get('id') as string;
    await userModel.update({ name: 'Updated' }, { where: { id } });
    const updated = await userModel.findByPk(id);
    expect(updated?.get('name')).toBe('Updated');

    await userModel.destroy({ where: { id } });
    const gone = await userModel.findByPk(id);
    expect(gone).toBeNull();
  });
});
