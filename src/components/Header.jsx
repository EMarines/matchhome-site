import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <h1>MatchHome</h1>
        </div>
        
        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`menu-backdrop ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            <li><a href="#" className="nav-link" onClick={() => setIsMenuOpen(false)}>Inicio</a></li>
            <li><a href="#" className="nav-link" onClick={() => setIsMenuOpen(false)}>Propiedades</a></li>
            <li><a href="#" className="nav-link" onClick={() => setIsMenuOpen(false)}>Nosotros</a></li>
            <li><a href="#" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contacto</a></li>
          </ul>

        </nav>


      </div>
      <style>{`
        .header {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
          height: var(--header-height);
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          position: relative;
        }
        .logo h1 {
          color: var(--color-primary);
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .nav-list {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .nav-link {
          font-weight: 500;
          color: var(--color-text-main);
          transition: color 0.2s;
          font-size: 0.95rem;
          position: relative;
        }
        .nav-link:after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: var(--color-secondary);
          transition: width 0.3s;
        }
        .nav-link:hover {
          color: var(--color-primary);
        }
        .nav-link:hover:after {
          width: 100%;
        }
        .header-actions-desktop {
          display: block;
        }
        .header-actions-mobile {
          display: none;
        }
        /* Backdrop */
        .menu-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1001; /* Below hamburger (1002) and nav (1001-ish) */
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(2px);
        }
        .menu-backdrop.open {
          opacity: 1;
          visibility: visible;
        }

        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 30px;
          height: 21px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 1003; /* Highest priority */
          position: relative;
        }
        .hamburger-line {
          width: 100%;
          height: 3px;
          background-color: var(--color-primary);
          border-radius: 3px;
          transition: all 0.3s ease-in-out;
          transform-origin: left center;
        }
        .hamburger-line.open:nth-child(1) {
          transform: rotate(45deg) translate(0px, -1px);
        }
        .hamburger-line.open:nth-child(2) {
          opacity: 0;
          width: 0;
        }
        .hamburger-line.open:nth-child(3) {
          transform: rotate(-45deg) translate(0px, 1px);
        }

        @media (max-width: 768px) {
          .header-actions-desktop {
            display: none;
          }
          .hamburger-btn {
            display: flex;
          }
          .nav {
            position: fixed;
            top: 0;
            right: 0;
            width: 75%;
            max-width: 300px;
            height: 100vh;
            background-color: var(--color-white);
            box-shadow: -5px 0 15px rgba(0,0,0,0.1);
            padding: 80px 2rem 2rem;
            transition: transform 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            transform: translateX(100%);
            z-index: 1002; /* Above backdrop, below hamburger */
          }
          .nav.nav-open {
            transform: translateX(0);
          }
          .nav-list {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            gap: 1.5rem;
          }
          .nav-link {
            font-size: 1.1rem;
            display: block;
            width: 100%;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--color-border);
          }
          .nav-link:after {
            display: none;
          }
          .header-actions-mobile {
            display: block;
            margin-top: auto;
          }
          .header-actions-mobile .btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
