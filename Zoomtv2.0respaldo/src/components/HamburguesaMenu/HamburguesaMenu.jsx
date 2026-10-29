import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HamburguesaMenu.css';

const HamburguesaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      setIsVisible(false);
      setTimeout(() => setIsOpen(false), 300);
    } else {
      setIsOpen(true);
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [isOpen]);

  const closeMenu = useCallback(() => {
    if (isOpen) {
      setIsVisible(false);
      setTimeout(() => setIsOpen(false), 300);
    }
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeMenu]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeMenu]);

  // Prevenir scroll body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Foco en primer link al abrir
  useEffect(() => {
    if (isOpen && isVisible && menuRef.current) {
      const focusableElement = menuRef.current.querySelector('a, button');
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [isOpen, isVisible]);

  return (
    <>
      <button
        ref={buttonRef}
        className={`nav-menu-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        aria-controls="menu-panel"
      >
        <span className="nav-single-bar"></span>
        <span className="menu-btn-text">{isOpen ? 'Cerrar' : 'Menú'}</span>
      </button>

      {isOpen && (
        <>
          <div
            ref={menuRef}
            id="menu-panel"
            className={`menu-panel ${isVisible ? 'visible' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
          >
            <div className="menu-header">
              <div className="logo-container">
                <h2>ZOOMTV</h2>
                <span>Canal 10</span>
              </div>
              <button
                onClick={closeMenu}
                className="close-btn"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>

            <nav className="menu-items" aria-label="Navegación principal">
              <Link to="/" onClick={closeMenu} className="menu-link">
                <span className="menu-icon" aria-hidden="true">🏠</span>
                <div className="menu-text">
                  <span className="menu-title">Inicio</span>
                  <span className="menu-desc">Página principal</span>
                </div>
              </Link>

              <Link to="/nosotros" onClick={closeMenu} className="menu-link">
                <span className="menu-icon" aria-hidden="true">👥</span>
                <div className="menu-text">
                  <span className="menu-title">Nosotros</span>
                  <span className="menu-desc">Conoce nuestro equipo</span>
                </div>
              </Link>

              {/* Submenú con toggle */}
              <div className={`menu-link has-submenu ${submenuOpen ? 'open' : ''}`}>
                <span className="menu-icon" aria-hidden="true">📰</span>
                <div className="menu-text">
                  <span className="menu-title">Actualidad</span>
                  <span className="menu-desc">Noticias y eventos</span>
                </div>
                <button
                  className="submenu-toggle"
                  onClick={() => setSubmenuOpen((prev) => !prev)}
                  aria-expanded={submenuOpen}
                  aria-label="Abrir o cerrar Actualidad"
                >
                  <span aria-hidden="true">{submenuOpen ? '⌃' : '›'}</span>
                </button>
                {submenuOpen && (
                  <ul className="submenu">
                    <li><Link to="/actualidad/deportes" onClick={closeMenu} className="submenu-link">Deportes</Link></li>
                    <li><Link to="/actualidad/musica" onClick={closeMenu} className="submenu-link">Música</Link></li>
                    <li><Link to="/actualidad/nacionales" onClick={closeMenu} className="submenu-link">Nacionales</Link></li>
                    <li><Link to="/actualidad/regionales" onClick={closeMenu} className="submenu-link">Regionales</Link></li>
                  </ul>
                )}
              </div>

              <Link to="/programacion" onClick={closeMenu} className="menu-link">
                <span className="menu-icon" aria-hidden="true">📺</span>
                <div className="menu-text">
                  <span className="menu-title">Programación</span>
                  <span className="menu-desc">Nuestros programas</span>
                </div>
              </Link>

              <Link to="/live" onClick={closeMenu} className="menu-link highlight">
                <span className="menu-icon" aria-hidden="true">🔴</span>
                <div className="menu-text">
                  <span className="menu-title">En Vivo</span>
                  <span className="menu-desc">Mira transmisión en directo</span>
                </div>
              </Link>

              <Link to="/anunciantes" onClick={closeMenu} className="menu-link">
                <span className="menu-icon" aria-hidden="true">💼</span>
                <div className="menu-text">
                  <span className="menu-title">Anunciantes</span>
                  <span className="menu-desc">Publicidad y espacios</span>
                </div>
              </Link>

            </nav>

            <div className="menu-footer">
              <p>© {new Date().getFullYear()} ZOOM TV Canal 10</p>
              <small>Tu canal de noticias las 24 horas</small>
            </div>
          </div>

          <div
            className={`menu-overlay ${isVisible ? 'visible' : ''}`}
            onClick={closeMenu}
            aria-hidden="true"
          ></div>
        </>
      )}
    </>
  );
};

export default HamburguesaMenu;
 