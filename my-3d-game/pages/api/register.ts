import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../lib/models';
import sequelize from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Register API called', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { username, password } = req.body;

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    console.log('Invalid input:', { username, password });
    return res.status(400).json({ error: 'Username and password must be non-empty strings' });
  }

  try {
    console.log('Attempting to authenticate database');
    await sequelize.authenticate();
    console.log('Database connection successful');

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.log('User already exists:', username);
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed:', { username, hashedPassword: hashedPassword.slice(0, 10) + '...' });

    const user = await User.create({ username, password: hashedPassword });
    console.log('User created:', { id: user.id, username, passwordStored: hashedPassword.slice(0, 10) + '...' });

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not set' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    console.log('Token generated:', { userId: user.id, token: token.slice(0, 10) + '...' });

    res.status(201).json({ token });
  } catch (error: any) {
    console.error('Register API error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error,
      username,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
      timestamp: new Date().toISOString(),
    });
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username already taken' });
    }
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}