import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../lib/models/User';
import sequelize from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Login API called with method:', req.method, 'Body:', req.body);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.status(200).json({ token });
  } catch (error: any) {
    console.error('Login API error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error,
    });
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}