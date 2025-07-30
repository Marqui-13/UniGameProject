import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';

class GameData extends Model {
  public id!: number;
  public user_id!: number;
  public score!: number;
  public progress!: object;
  public created_at!: Date;
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
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    progress: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'GameData',
    tableName: 'GameData',
    timestamps: false,
  }
);

export default GameData;