import { useState, useEffect } from 'react';
import axios from 'axios';
import GameCanvas from '../components/GameCanvas';

export default function Game() {
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/leaderboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard');
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>3D Game</h1>
      <h2 style={{ textAlign: 'center' }}>Score: {score}</h2>
      <h3 style={{ textAlign: 'center' }}>Leaderboard</h3>
      <ul style={{ textAlign: 'center', listStyle: 'none' }}>
        {leaderboard.map((entry: any) => (
          <li key={entry.id}>
            {entry.User.username}: {entry.score}
          </li>
        ))}
      </ul>
      <GameCanvas setScore={setScore} />
    </div>
  );
}