import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../lib/models';
import sequelize from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Login API called', {
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

    console.log('Finding user:', username);
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    console.log('User found:', { id: user.id, username, passwordStored: user.password ? user.password.slice(0, 10) + '...' : 'null' });

    console.log('Verifying password for user:', username);
    if (!user.password || typeof user.password !== 'string' || !user.password.startsWith('$2b$')) {
      console.error('Invalid password format in database:', { username, password: user.password });
      return res.status(500).json({ error: 'Server error: Invalid password format in database' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    console.log('Password verified for user:', username);

    console.log('Checking JWT_SECRET');
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not set' });
    }
    console.log('Generating token for user:', user.id);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    console.log('Token generated:', { userId: user.id, token: token.slice(0, 10) + '...' });

    res.status(200).json({ token });
  } catch (error: any) {
    console.error('Login API error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error,
      username,
      passwordProvided: password ? 'Provided' : 'Not provided',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
      timestamp: new Date().toISOString(),
    });
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    if (error.message.includes('data and hash arguments required')) {
      return res.status(500).json({ error: 'Password verification error', details: 'Invalid password data or hash format' });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}