/**
 * Sequelize Model for Greeting Entity
 */

import {
  DataTypes,
  SequelizeModel as Model,
  type Sequelize,
} from '@sentzunhat/zacatl/third-party/sequelize';
import type { Greeting } from '../../../domain/entities/greeting';

export class GreetingModel extends Model implements Omit<Greeting, 'id'> {
  declare id: string;
  declare message: string;
  declare language: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initGreetingModel(sequelize: Sequelize): typeof GreetingModel {
  GreetingModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'greetings',
      timestamps: true,
    },
  );

  return GreetingModel;
}
