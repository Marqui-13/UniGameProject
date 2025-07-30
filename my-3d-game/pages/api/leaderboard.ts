import type { NextApiRequest, NextApiResponse } from 'next';
import GameData from '../../lib/models/GameData';
import User from '../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const leaderboard = await GameData.findAll({
      include: [{ model: User, attributes: ['username'] }],
      order: [['score', 'DESC']],
      limit: 10,
    });
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}