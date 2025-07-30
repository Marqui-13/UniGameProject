import sequelize from './lib/db';
import User from './lib/models/User';
import GameData from './lib/models/GameData';

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    await User.sync({ force: false });
    await GameData.sync({ force: false });
    console.log('Database synced');
  } catch (error: unknown) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();