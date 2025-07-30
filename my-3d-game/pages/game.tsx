import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const GameCanvas = dynamic(() => import('../components/GameCanvas'), { ssr: false });

export default function Game() {
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
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
  }, [score, isClient]);

  return (
    <div>
      {/* <h1 style={{ textAlign: 'center' }}>3D Cube Collector</h1> */}
      <h2 style={{ textAlign: 'center' }}>Score: {score}</h2>
      <h3 style={{ textAlign: 'center' }}>Leaderboard</h3>
      {isClient ? (
        <>
          <button
            style={{ display: 'block', margin: '10px auto' }}
            onClick={fetchLeaderboard}
          >
            Refresh Leaderboard
          </button>
          <ul style={{ textAlign: 'center', listStyle: 'none' }}>
            {leaderboard.map((entry: any) => (
              <li key={entry.id}>
                {entry.User.username}: {entry.score}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading leaderboard...</p>
      )}
      <GameCanvas setScore={setScore} />
    </div>
  );
}