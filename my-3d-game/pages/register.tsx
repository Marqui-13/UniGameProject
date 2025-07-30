import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await axios.post('/api/register', { username, password });
      alert('Registration successful! Please log in.');
      router.push('/login');
    } catch (error) {
      alert('Registration failed! Username may be taken.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Register</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        style={{ display: 'block', margin: '10px auto', padding: '5px' }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ display: 'block', margin: '10px auto', padding: '5px' }}
      />
      <button onClick={handleRegister}>Register</button>
      <p>
        Already have an account?{' '}
        <a href="/login" onClick={() => router.push('/login')}>
          Login
        </a>
      </p>
    </div>
  );
}