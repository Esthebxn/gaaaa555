import React, { useState } from 'react';
import Dashboard from './Dashboard/Dashboard';
import Login from './Login/Login';
import { isAuthenticated, clearAuthenticated } from './Login/authConfig';
import './styles/shared.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  const handleLogout = () => {
    clearAuthenticated();
    setLoggedIn(false);
  };

  return (
    <div className="App">
      {loggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
