import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/game');
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to the 3D Game</h1>
      <p>Log in or register to play!</p>
      <button onClick={() => router.push('/login')}>Login</button>
      <button onClick={() => router.push('/register')} style={{ marginLeft: '10px' }}>
        Register
      </button>
    </div>
  );
}