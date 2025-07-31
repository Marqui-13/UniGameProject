import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { User, GameData } from '../../lib/models'; // Import from index.ts
import sequelize from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Leaderboard API called', {
    method: req.method,
    headers: req.headers,
    url: req.url,
  });

  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    console.log('Attempting to authenticate database');
    await sequelize.authenticate();
    console.log('Database connection successful');

    console.log('Verifying JWT token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Token decoded:', decoded);

    console.log('Fetching leaderboard data');
    const [easy, medium, hard] = await Promise.all([
      GameData.findAll({
        where: { level: 'easy' },
        include: [{ model: User, attributes: ['username'] }],
        order: [['time', 'DESC']],
        limit: 10,
      }).catch((err) => {
        console.error('Easy leaderboard query failed:', err);
        throw err;
      }),
      GameData.findAll({
        where: { level: 'medium' },
        include: [{ model: User, attributes: ['username'] }],
        order: [['time', 'DESC']],
        limit: 10,
      }).catch((err) => {
        console.error('Medium leaderboard query failed:', err);
        throw err;
      }),
      GameData.findAll({
        where: { level: 'hard' },
        include: [{ model: User, attributes: ['username'] }],
        order: [['time', 'DESC']],
        limit: 10,
      }).catch((err) => {
        console.error('Hard leaderboard query failed:', err);
        throw err;
      }),
    ]);

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
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}