import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css'; // Archivo CSS específico para este navbar

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/inicio' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="zoom-navbar">
      <div className="zoom-navbar-container">
        <Link to="/" className="zoom-navbar-logo">
          <span className="zoom-logo-text">ZOOM</span>
          <span className="app-logo-text">TV</span>
        </Link>

        <ul className="zoom-navbar-links">
          <li className="zoom-nav-item">
            <Link 
              to="/inicio" 
              className={`zoom-nav-link ${isActive('/inicio') ? 'active' : ''}`}
            >
              Inicio
            </Link>
          </li>

          <li className="zoom-nav-item">
            <Link 
              to="/nosotros" 
              className={`zoom-nav-link ${isActive('/nosotros') ? 'active' : ''}`}
            >
              Nosotros
            </Link>
          </li>

          <li className="zoom-nav-item dropdown">
            <Link 
              to="/actualidad" 
              className={`zoom-nav-link ${isActive('/actualidad') ? 'active' : ''}`}
            >
              Actualidad
            </Link>
            <div className="zoom-dropdown-menu">
              <Link to="/actualidad/deportes" className="zoom-dropdown-item">Deportes</Link>
              <Link to="/actualidad/nacionales" className="zoom-dropdown-item">Nacionales</Link>
              <Link to="/actualidad/regionales" className="zoom-dropdown-item">Regionales</Link>
              <Link to="/actualidad/musica" className="zoom-dropdown-item">Música</Link>
            </div>
          </li>

          <li className="zoom-nav-item">
            <Link 
              to="/programacion" 
              className={`zoom-nav-link ${isActive('/programacion') ? 'active' : ''}`}
            >
              Programación
            </Link>
          </li>

          <li className="zoom-nav-item highlight">
            <Link 
              to="/envivo" 
              className={`zoom-nav-link highlight-link ${isActive('/envivo') ? 'active' : ''}`}
            >
              Ver en Vivo
            </Link>
          </li>

          <li className="zoom-nav-item">
            <Link 
              to="/anunciantes" 
              className={`zoom-nav-link ${isActive('/anunciantes') ? 'active' : ''}`}
            >
              Anunciantes
            </Link>
          </li>

        </ul>
      </div>
    </nav>
  );
};

export default Navbar;  
