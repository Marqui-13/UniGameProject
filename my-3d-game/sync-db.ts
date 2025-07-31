import { Sequelize } from 'sequelize';
import { User, GameData } from './lib/models';
import sequelize from './lib/db';

async function main() {
  try {
    console.log('Authenticating database connection');
    await sequelize.authenticate();
    console.log('Database connection successful');

    console.log('Syncing database schema');
    await sequelize.sync({ alter: true }); // Use alter to update schema without dropping data
    console.log('Database synced');
  } catch (error: any) {
    console.error('Database sync error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
    process.exit(1);
  }
}

main();