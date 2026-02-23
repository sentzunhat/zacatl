import { newDb } from 'pg-mem';
import { Sequelize, DataTypes } from 'sequelize';
import { describe, it, expect, beforeAll } from 'vitest';

describe('SequelizeRepository (pg-mem)', () => {
  let sequelize: Sequelize;
  let UserModel: any;

  beforeAll(async () => {
    // Create an in-memory Postgres instance
    const db = newDb();
    const pg = db.adapters.createPg();

    // Create Sequelize instance using pg-mem's PG adapter
    sequelize = new Sequelize('postgres://user:password@localhost/db', {
      dialect: 'postgres',
      dialectModule: pg,
      logging: false,
    } as any);

    UserModel = sequelize.define(
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
    const created = await UserModel.create({ name: 'PgMemUser' });
    expect(created).toBeDefined();
    const found = await UserModel.findByPk(created.id);
    expect(found).not.toBeNull();
    expect(found.name).toBe('PgMemUser');
  });

  it('updates and deletes a record', async () => {
    const created = await UserModel.create({ name: 'ToUpdate' });
    await UserModel.update({ name: 'Updated' }, { where: { id: created.id } });
    const updated = await UserModel.findByPk(created.id);
    expect(updated.name).toBe('Updated');

    await UserModel.destroy({ where: { id: created.id } });
    const gone = await UserModel.findByPk(created.id);
    expect(gone).toBeNull();
  });
});
