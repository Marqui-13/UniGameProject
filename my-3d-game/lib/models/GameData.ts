import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import User from './User';

class GameData extends Model {
  public id!: number;
  public user_id!: number;
  public level!: string;
  public time!: number;
  public progress!: object;
  public createdAt!: Date;
  public updatedAt!: Date;
}

GameData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    level: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['easy', 'medium', 'hard']],
      },
    },
    time: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    progress: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'createdAt',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updatedAt',
    },
  },
  {
    sequelize,
    modelName: 'GameData',
    tableName: 'GameData',
    timestamps: true,
  }
);

GameData.belongsTo(User, { foreignKey: 'user_id' });

export default GameData;