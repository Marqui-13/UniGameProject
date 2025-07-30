import sequelize from './lib/db';

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
  } catch (error: unknown) {
    console.error('Error connecting to database:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabaseConnection();