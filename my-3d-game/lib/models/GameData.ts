import { Model, DataTypes } from 'sequelize';
import sequelize from '../../lib/db';

class GameData extends Model {
  public id!: number;
  public user_id!: number;
  public level!: 'easy' | 'medium' | 'hard';
  public time!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initModel(sequelize: any) {
    GameData.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
        },
        level: { type: DataTypes.ENUM('easy', 'medium', 'hard'), allowNull: false },
        time: { type: DataTypes.FLOAT, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      {
        sequelize,
        modelName: 'GameData',
        tableName: 'GameData',
      }
    );
  }
}

export default GameData;