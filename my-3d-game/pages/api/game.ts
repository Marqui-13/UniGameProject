import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import GameData from '../../lib/models/GameData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const { score, progress } = req.body;
    await GameData.create({ user_id: decoded.userId, score, progress });
    res.status(201).json({ message: 'Game data saved' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}