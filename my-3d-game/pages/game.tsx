import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useGameStore from '../lib/store';

const GameCanvas = dynamic(() => import('../components/GameCanvas'), { ssr: false });

export default function Game() {
  const {
    time,
    level,
    isGameStarted,
    leaderboard,
    setLevel,
    setIsGameStarted,
    moveLane,
    setLeaderboard,
  } = useGameStore();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for leaderboard');
        router.push('/login');
        return;
      }
      const response = await axios.get('/api/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(response.data);
      console.log('Leaderboard fetched:', response.data);
    } catch (error: any) {
      console.error('Failed to fetch leaderboard:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (isClient) fetchLeaderboard();
  }, [time, isClient]);

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <h1>3D Spaceship Game</h1>
      <h2>Survival Time: {time.toFixed(2)}s</h2>
      <div>
        <label>Select Level: </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as 'easy' | 'medium' | 'hard')}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <button
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px' }}
        onClick={() => setIsGameStarted(true)}
        disabled={isGameStarted}
      >
        Start Game
      </button>
      <h3>Leaderboard</h3>
      {isClient ? (
        <>
          <button style={{ margin: '10px', padding: '10px 20px', fontSize: '16px' }} onClick={fetchLeaderboard}>
            Refresh Leaderboard
          </button>
          <div>
            <h4>Easy</h4>
            <ul style={{ listStyle: 'none' }}>
              {leaderboard.easy.map((entry: any) => (
                <li key={entry.id}>
                  {entry.User.username}: {entry.time.toFixed(2)}s
                </li>
              ))}
            </ul>
            <h4>Medium</h4>
            <ul style={{ listStyle: 'none' }}>
              {leaderboard.medium.map((entry: any) => (
                <li key={entry.id}>
                  {entry.User.username}: {entry.time.toFixed(2)}s
                </li>
              ))}
            </ul>
            <h4>Hard</h4>
            <ul style={{ listStyle: 'none' }}>
              {leaderboard.hard.map((entry: any) => (
                <li key={entry.id}>
                  {entry.User.username}: {entry.time.toFixed(2)}s
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p>Loading leaderboard...</p>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
          zIndex: 10,
        }}
      >
        <button
          style={{
            width: '60px',
            height: '60px',
            fontSize: '24px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '10px',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
          onClick={() => moveLane('left')}
          onTouchStart={() => moveLane('left')}
          disabled={!isGameStarted}
        >
          ←
        </button>
        <button
          style={{
            width: '60px',
            height: '60px',
            fontSize: '24px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '10px',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
          onClick={() => moveLane('right')}
          onTouchStart={() => moveLane('right')}
          disabled={!isGameStarted}
        >
          →
        </button>
      </div>
      <GameCanvas />
    </div>
  );
}