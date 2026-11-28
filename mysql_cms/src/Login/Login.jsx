import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, User, LogIn, KeyRound } from 'lucide-react';
import { API_URL } from '../services/api';
import { setAuthenticated } from './authConfig';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.token) throw new Error(result.error || 'No fue posible iniciar sesión.');
      setAuthenticated(result.token);
      setError('');
      onLogin();
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión.');
    } finally {
      setSubmitting(false);
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
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="login-input-wrapper">
              <KeyRound className="login-input-icon" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" autoComplete="current-password" required />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="primary-btn login-submit">
            <LogIn className="icon" />
            {submitting ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
