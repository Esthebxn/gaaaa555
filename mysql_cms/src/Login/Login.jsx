import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, User, LogIn } from 'lucide-react';
import { checkCredentials, setAuthenticated } from './authConfig';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (checkCredentials(username)) {
      setAuthenticated();
      setError('');
      onLogin();
    } else {
      setError('Ingresa un usuario');
    }
  };

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <div className="login-logo">
          <div className="logo-icon">
            <BarChart3 className="icon" />
          </div>
          <h1>ZoomTV CMS</h1>
          <p>Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <div className="login-input-wrapper">
              <User className="login-input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="admin"
                autoFocus
                required
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="primary-btn login-submit">
            <LogIn className="icon" />
            Ingresar
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
