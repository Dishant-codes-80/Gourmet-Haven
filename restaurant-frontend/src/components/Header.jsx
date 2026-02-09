import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkStyle = {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2c3e50',
    textDecoration: 'none',
    padding: '8px 0',
    display: 'block'
  };

  return (
    <header className="header-main">
      <div className="main-navbar">
        <div className="logo-container">
          <img src="/GH.jpg" alt="Logo" className="header-logo" />
          <div className="logo-text">
            <h1 className="restaurant-name">Gourmet Haven</h1>
            <p className="restaurant-slogan">Fine Dining Excellence</p>
          </div>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle navigation">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`nav-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-list">
            <li><Link to="/" style={navLinkStyle} onClick={closeMenu}>🏠 Home</Link></li>
            <li><Link to="/menu" style={navLinkStyle} onClick={closeMenu}>🍽️ Menu</Link></li>
            <li><Link to="/orders" style={navLinkStyle} onClick={closeMenu}>📋 Orders</Link></li>
            <li><Link to="/reservations" style={navLinkStyle} onClick={closeMenu}>📅 Reservations</Link></li>
            <li><Link to="/chefs" style={navLinkStyle} onClick={closeMenu}>👨‍🍳 Chefs</Link></li>
            <li><Link to="/staff" style={navLinkStyle} onClick={closeMenu}>👔 Staff</Link></li>
            {user && <li><Link to="/dashboard" style={navLinkStyle} onClick={closeMenu}>👤 Dashboard</Link></li>}
            {user && <li><Link to="/inventory" style={navLinkStyle} onClick={closeMenu}>📦 Inventory</Link></li>}
            {!user && <li><Link to="/login" style={navLinkStyle} onClick={closeMenu}>🔒 Admin</Link></li>}
          </ul>
        </nav>
      </div>

      {user && (
        <div className="admin-sub-bar">
          <span className="user-info">👤 {user.email}</span>
          <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      <style>{`
        .header-main {
          display: flex;
          flex-direction: column;
          padding: 8px 15px;
          background-color: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .main-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .logo-container {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .header-logo {
          height: 80px;
          margin-right: 15px;
          border-radius: 8px;
        }

        .restaurant-name {
          margin: 0;
          font-size: 1.6em;
          color: #e74c3c;
          white-space: nowrap;
        }

        .restaurant-slogan {
          margin: 0;
          font-size: 0.8em;
          color: #666;
        }

        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
          gap: 12px;
          flex-wrap: nowrap;
        }

        .nav-list li {
          flex-shrink: 0;
        }

        .admin-sub-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 15px;
          padding: 5px 0 0 0;
        }

        .user-info {
          color: #666;
          font-size: 0.85rem;
        }

        .logout-btn {
          padding: 4px 12px;
          font-size: 0.85rem;
        }

        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 30px;
          height: 21px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 1001;
        }

        .mobile-menu-toggle .bar {
          height: 3px;
          width: 100%;
          background-color: #2c3e50;
          border-radius: 10px;
          transition: all 0.3s linear;
        }

        @media (max-width: 1024px) {
          .header-main {
            padding: 10px 20px;
          }
          
          .nav-list {
            gap: 8px;
          }
        }

        @media (max-width: 900px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .nav-container {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: #fff;
            box-shadow: 0 5px 10px rgba(0,0,0,0.1);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out;
          }

          .nav-container.mobile-open {
            max-height: 500px;
          }

          .nav-list {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
            gap: 0;
          }

          .nav-list li {
            width: 100%;
            border-bottom: 1px solid #f0f0f0;
          }

          .nav-list li:last-child {
            border-bottom: none;
          }

          .admin-sub-bar {
            justify-content: center;
            padding: 10px 0;
            border-top: 1px solid #f0f0f0;
          }

          .header-logo {
            height: 75px;
            margin-right: 12px;
          }

          .logo-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .restaurant-name {
            font-size: 1.15em;
            white-space: normal;
            letter-spacing: -0.5px;
            line-height: 1.2;
          }

          .restaurant-slogan {
            font-size: 0.75em;
            white-space: nowrap;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
