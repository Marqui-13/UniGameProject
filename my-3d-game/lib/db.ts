import { Sequelize } from 'sequelize';
import { User, GameData } from './models';

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  logging: (msg) => console.log('Sequelize:', msg),
});

User.initModel(sequelize);
GameData.initModel(sequelize);

User.hasMany(GameData, { foreignKey: 'user_id' });
GameData.belongsTo(User, { foreignKey: 'user_id' });

export default sequelize;