import type { NextApiRequest, NextApiResponse } from 'next';
  import jwt from 'jsonwebtoken';
  import GameData from '../../lib/models/GameData';
  import User from '../../lib/models/User';
  import sequelize from '../../lib/db';

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
      await sequelize.authenticate();
      await sequelize.sync();
      jwt.verify(token, process.env.JWT_SECRET!);
      const leaderboard = await GameData.findAll({
        include: [{ model: User, attributes: ['username'] }],
        order: [['score', 'DESC']],
        limit: 10,
      });
      res.status(200).json(leaderboard);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized: Token expired' });
      }
      console.error('Leaderboard API error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error,
      });
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }