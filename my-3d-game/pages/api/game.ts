import type { NextApiRequest, NextApiResponse } from 'next';
  import jwt from 'jsonwebtoken';
  import GameData from '../../lib/models/GameData';
  import sequelize from '../../lib/db';

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
      await sequelize.authenticate();
      await sequelize.sync();
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
      const { score } = req.body;

      if (typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid score format' });
      }

      await GameData.create({ user_id: decoded.userId, score, progress: {} });
      res.status(200).json({ message: 'Score saved' });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized: Token expired' });
      }
      console.error('Game API error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error,
      });
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }