import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bike, Menu, X } from 'lucide-react';
import ProfileModal from './ProfileModal';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin' || location.pathname === '/forgot-password') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide the global Navbar on the dashboard page, as it has its own layout
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="main-navbar">
      <div className="main-navbar-wrapper">
        {/* Logo */}
        <Link to="/" className="main-navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <Bike size={24} className="main-logo-icon" />
          <span>Bike Rental</span>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="main-navbar-center">
          <Link to="/" className={`main-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          {user?.role !== 'admin' && (
            <>
              <Link to="/my-bookings" className={`main-nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>My Bookings</Link>
              <Link to="/about" className={`main-nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
              <Link to="/contact" className={`main-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/dashboard" className="main-nav-link" style={{ color: '#ff5e14', fontWeight: 'bold' }}>Dashboard 🚀</Link>
          )}
        </div>

        {/* Right Section (Desktop) */}
        <div className="main-navbar-right">
          {user ? (
            <>
              {user.role !== 'admin' && (
                <span onClick={() => setShowProfileModal(true)} className="main-greeting" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                  Hi, {user.name} 👋
                </span>
              )}
              <button onClick={handleLogout} className="main-btn-logout">Logout</button>
            </>
          ) : (
            <div className="main-auth-buttons">
              <button onClick={() => navigate('/login')} className="main-btn-login">Login</button>
              <button onClick={() => navigate('/register')} className="main-btn-signup">Sign Up</button>
            </div>
          )}
        </div>

        {/* Hamburger Toggle Button (Mobile & Tablet) */}
        <button 
          className="main-navbar-hamburger" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="main-navbar-mobile-menu">
          <Link to="/" className={`main-mobile-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          {user?.role !== 'admin' && (
            <>
              <Link to="/my-bookings" className={`main-mobile-link ${location.pathname === '/my-bookings' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                My Bookings
              </Link>
              <Link to="/about" className={`main-mobile-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className={`main-mobile-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/dashboard" className="main-mobile-link" style={{ color: '#ff5e14', fontWeight: 'bold' }} onClick={() => setMobileMenuOpen(false)}>
              Dashboard 🚀
            </Link>
          )}

          <div className="main-mobile-divider"></div>

          {user ? (
            <div className="main-mobile-user-section">
              {user.role !== 'admin' && (
                <div 
                  onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }} 
                  className="main-mobile-greeting"
                >
                  Hi, {user.name} 👋 <span style={{ fontSize: '12px', color: '#ff5e14', marginLeft: '6px' }}>(View Profile)</span>
                </div>
              )}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="main-btn-logout main-btn-full">
                Logout
              </button>
            </div>
          ) : (
            <div className="main-mobile-auth-buttons">
              <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="main-btn-login main-btn-full">
                Login
              </button>
              <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} className="main-btn-signup main-btn-full">
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </nav>
  );
};

export default Navbar;
