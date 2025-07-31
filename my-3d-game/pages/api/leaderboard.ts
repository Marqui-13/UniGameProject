import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import GameData from '../../lib/models/GameData';
import User from '../../lib/models/User';
import sequelize from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Leaderboard API called with method:', req.method, 'Headers:', req.headers);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    await sequelize.sync();
    console.log('Database synced');

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Token decoded:', decoded);

    const easy = await GameData.findAll({
      where: { level: 'easy' },
      include: [{ model: User, attributes: ['username'] }],
      order: [['time', 'DESC']],
      limit: 10,
    });
    const medium = await GameData.findAll({
      where: { level: 'medium' },
      include: [{ model: User, attributes: ['username'] }],
      order: [['time', 'DESC']],
      limit: 10,
    });
    const hard = await GameData.findAll({
      where: { level: 'hard' },
      include: [{ model: User, attributes: ['username'] }],
      order: [['time', 'DESC']],
      limit: 10,
    });

    console.log('Leaderboard data fetched:', {
      easy: easy.length,
      medium: medium.length,
      hard: hard.length,
    });

    res.status(200).json({ easy, medium, hard });
  } catch (error: any) {
    console.error('Leaderboard API error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error,
      token: token ? 'Provided' : 'Not provided',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    });
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}