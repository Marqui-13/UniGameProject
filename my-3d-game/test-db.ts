import type { NextApiRequest, NextApiResponse } from 'next';
import sequelize from './lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await sequelize.authenticate();
    res.status(200).json({ message: 'Database connection established' });
  } catch (error: any) {
    console.error('Test DB error:', error.name, error.message, error.stack);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
}