import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bike } from 'lucide-react';
import ProfileModal from './ProfileModal';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin') {
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
        <Link to="/" className="main-navbar-logo">
          <Bike size={24} className="main-logo-icon" />
          <span>Bike Rental</span>
        </Link>

        {/* Center Links */}
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

        {/* Right Section */}
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
      </div>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </nav>
  );
};

export default Navbar;
