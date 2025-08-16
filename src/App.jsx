import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Auth from './Auth';
import Account from './Account';
import GamePage from './Game';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Router>
      <div className="container" style={{ padding: '50px 0 100px 0' }}>
        <Routes>
          <Route
            path="/"
            element={
              !session ? (
                <Auth />
              ) : (
                <>
                  <Account session={session} />
                  <Link to="/game">
                    <button
                      style={{
                        display: 'block',
                        marginTop: '20px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                      }}
                    >
                      Play Game
                    </button>
                  </Link>
                </>
              )
            }
          />
          <Route path="/game" element={<GamePage session={session} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;