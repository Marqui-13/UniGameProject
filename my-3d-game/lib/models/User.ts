import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  static initModel(sequelize: any) {
    User.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
      }
    );
  }
}

export default User;