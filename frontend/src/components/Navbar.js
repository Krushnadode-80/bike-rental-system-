import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import client from '../api/client';
import { 
  Bike, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Bell, 
  User as UserIcon, 
  CreditCard, 
  LogOut, 
  ChevronDown, 
  MapPin,
  Home as HomeIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  ShieldCheck as ShieldIcon,
  CheckCircle2,
  Heart
} from 'lucide-react';
import ProfileModal from './ProfileModal';
import './Navbar.css';
import toast from 'react-hot-toast';

const CITIES = [
  'Pune / Hinjewadi',
  'Pune / Wakad',
  'Pune / Viman Nagar',
  'Pune / Swargate',
  'Bengaluru / Indiranagar',
  'Bengaluru / Koramangala',
  'Bengaluru / HSR Layout',
  'Bengaluru / Whitefield'
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [mobileCityOpen, setMobileCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(() => {
    const saved = localStorage.getItem('bike_selected_city');
    if (saved && (saved.includes('Mumbai') || saved.includes('Delhi'))) {
      localStorage.setItem('bike_selected_city', 'Pune / Hinjewadi');
      return 'Pune / Hinjewadi';
    }
    return saved || 'Pune / Hinjewadi';
  });

  const getStoredLikes = () => {
    try {
      return JSON.parse(localStorage.getItem('bike_saved_favorites') || '[]');
    } catch {
      return [];
    }
  };

  const [likedCount, setLikedCount] = useState(() => getStoredLikes().length);

  useEffect(() => {
    const syncLikes = () => {
      setLikedCount(getStoredLikes().length);
    };

    window.addEventListener('bike_favorites_updated', syncLikes);
    window.addEventListener('storage', syncLikes);

    if (user) {
      client.get('/favorites')
        .then((res) => {
          if (Array.isArray(res.data)) {
            const backendIds = res.data.map(b => b.id);
            const localIds = getStoredLikes();
            const merged = Array.from(new Set([...localIds, ...backendIds]));
            localStorage.setItem('bike_saved_favorites', JSON.stringify(merged));
            setLikedCount(merged.length);
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('bike_favorites_updated', syncLikes);
      window.removeEventListener('storage', syncLikes);
    };
  }, [user]);

  const profileDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setCityDropdownOpen(false);
    setMobileCityOpen(false);
  }, [location.pathname]);

  if (
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/admin' ||
    location.pathname === '/forgot-password'
  ) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'white' ? 'black' : 'white';
    changeTheme(nextTheme);
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('bike_selected_city', city);
    setCityDropdownOpen(false);
    toast.success(`Location set to ${city.split('/')[0].trim()}`);
  };

  const handleBellClick = () => {
    toast.dismiss();
  };

  // Avatar URL with smart fallback
  const getAvatarUrl = () => {
    if (user?.profile_photo) {
      if (user.profile_photo.startsWith('http')) return user.profile_photo;
      return `http://localhost:8000${user.profile_photo}`;
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop';
  };

  // Hide the global Navbar on dashboard as it has custom admin layout
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="main-navbar">
      <div className="main-navbar-wrapper">
        {/* Left: Brand Logo */}
        <Link to="/" className="main-navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <Bike size={24} className="main-logo-icon" />
          <span>Bike Rental</span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="main-navbar-center">
          <Link to="/" className={`main-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          {user && user.role !== 'admin' && (
            <Link to="/my-bookings" className={`main-nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
              My Bookings
            </Link>
          )}
          {user?.role !== 'admin' && (
            <>
              <Link to="/about" className={`main-nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                About
              </Link>
              <Link to="/contact" className={`main-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                Contact
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/dashboard" className="main-nav-link admin-nav-link">
              Dashboard 🚀
            </Link>
          )}
        </div>

        {/* Right Section: Location Pill, Theme Toggle, Notifications, Profile Dropdown */}
        <div className="main-navbar-right">
          {/* City / Location Picker */}
          <div className="nav-location-wrapper" ref={cityDropdownRef}>
            <button 
              className="nav-location-pill"
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              title="Change pickup location"
              aria-label="Location selector"
            >
              <MapPin size={16} className="nav-location-pin" />
              <span className="nav-location-label">{selectedCity}</span>
              <ChevronDown size={14} className={`nav-dropdown-chevron ${cityDropdownOpen ? 'open' : ''}`} />
            </button>

            {cityDropdownOpen && (
              <div className="nav-city-dropdown-menu animate-fade-in">
                <div className="nav-city-dropdown-title">Select Hub / City</div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#ff5e14', padding: '6px 12px 2px 12px', letterSpacing: '0.5px' }}>
                  PUNE
                </div>
                {CITIES.filter(c => c.startsWith('Pune')).map((city) => (
                  <button
                    key={city}
                    className={`nav-city-dropdown-item ${city === selectedCity ? 'active' : ''}`}
                    onClick={() => handleSelectCity(city)}
                  >
                    <MapPin size={14} />
                    <span>{city}</span>
                  </button>
                ))}

                <div style={{ fontSize: '10px', fontWeight: 800, color: '#ff5e14', padding: '8px 12px 2px 12px', letterSpacing: '0.5px', borderTop: '1px solid var(--border-color)', marginTop: '4px' }}>
                  BENGALURU
                </div>
                {CITIES.filter(c => c.startsWith('Bengaluru')).map((city) => (
                  <button
                    key={city}
                    className={`nav-city-dropdown-item ${city === selectedCity ? 'active' : ''}`}
                    onClick={() => handleSelectCity(city)}
                  >
                    <MapPin size={14} />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle (Moon / Sun) */}
          <button 
            className="nav-icon-action-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            title={theme === 'white' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'white' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notification Bell */}
          <button 
            className="nav-icon-action-btn nav-bell-btn"
            onClick={handleBellClick}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />
          </button>

          {/* User Account Dropdown (or Auth Buttons if Guest) */}
          {user ? (
            <div className="nav-profile-dropdown-wrapper" ref={profileDropdownRef}>
              <button 
                className="nav-avatar-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User Account Menu"
                aria-expanded={profileDropdownOpen}
              >
                <div className="nav-avatar-circle">
                  <img 
                    src={getAvatarUrl()} 
                    alt={user.name || 'User profile'} 
                    className="nav-avatar-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop';
                    }}
                  />
                </div>
                <ChevronDown size={14} className={`nav-avatar-chevron ${profileDropdownOpen ? 'open' : ''}`} />
              </button>

              {/* Dropdown Floating Card matching the user request */}
              {profileDropdownOpen && (
                <div className="nav-user-menu-card animate-fade-in">
                  <div className="nav-user-menu-header">
                    <div className="nav-user-menu-avatar-row">
                      <div className="nav-avatar-circle header-circle">
                        <img 
                          src={getAvatarUrl()} 
                          alt={user.name || 'User profile'} 
                          className="nav-avatar-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop';
                          }}
                        />
                      </div>
                      <div className="nav-user-menu-details">
                        <h4 className="nav-user-menu-role">
                          {user.role === 'admin' ? 'Administrator' : 'Rider Account'}
                        </h4>
                        <p className="nav-user-menu-email">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="nav-user-menu-items">
                    {user.role !== 'admin' && (
                      <>
                        <button 
                          className="nav-user-menu-item"
                          onClick={() => {
                            setShowProfileModal(true);
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <UserIcon size={16} />
                          <span>My Profile</span>
                        </button>

                        <button 
                          className="nav-user-menu-item"
                          onClick={() => {
                            navigate('/liked-bikes');
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <Heart size={16} color="#ef4444" fill={likedCount > 0 ? "#ef4444" : "none"} />
                          <span>Liked Bikes</span>
                          {likedCount > 0 && <span className="nav-likes-badge">{likedCount}</span>}
                        </button>

                        <button 
                          className="nav-user-menu-item"
                          onClick={() => {
                            navigate('/my-bookings');
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <Bike size={16} />
                          <span>Active Rentals</span>
                        </button>

                        <button 
                          className="nav-user-menu-item"
                          onClick={() => {
                            navigate('/terms');
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <CreditCard size={16} />
                          <span>Payment Methods</span>
                        </button>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <button 
                        className="nav-user-menu-item"
                        onClick={() => {
                          navigate('/dashboard');
                          setProfileDropdownOpen(false);
                        }}
                      >
                        <Bike size={16} />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="nav-user-menu-divider"></div>

                    <button 
                      className="nav-user-menu-item logout"
                      onClick={() => {
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="main-auth-buttons">
              <button onClick={() => navigate('/login')} className="main-btn-login">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="main-btn-signup">
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Actions (Theme Switcher, Avatar if logged in, Hamburger) */}
        <div className="main-navbar-mobile-actions">
          {/* Quick theme switcher on mobile */}
          <button 
            className="nav-icon-action-btn mobile-theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            title={theme === 'white' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'white' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Quick Profile avatar on mobile if user is logged in */}
          {user && (
            <button
              className="nav-avatar-circle mobile-avatar-btn"
              onClick={() => setShowProfileModal(true)}
              title="Open My Profile"
              aria-label="My Profile"
            >
              <img 
                src={getAvatarUrl()} 
                alt={user.name || 'User'} 
                className="nav-avatar-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop';
                }}
              />
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button 
            className="main-navbar-hamburger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="main-navbar-mobile-menu animate-fade-in">
          {/* In-drawer collapsible Location / Hub Picker */}
          <div className="main-mobile-location-box">
            <button 
              type="button"
              className="main-mobile-location-trigger"
              onClick={() => setMobileCityOpen(!mobileCityOpen)}
              aria-expanded={mobileCityOpen}
            >
              <div className="main-mobile-location-trigger-left">
                <MapPin size={16} color="var(--brand-orange)" />
                <div className="main-mobile-location-trigger-text">
                  <span className="main-mobile-location-sub">Pickup Location</span>
                  <span className="main-mobile-location-val">{selectedCity}</span>
                </div>
              </div>
              <ChevronDown size={15} className={`main-mobile-chevron ${mobileCityOpen ? 'open' : ''}`} />
            </button>

            {mobileCityOpen && (
              <div className="main-mobile-city-list animate-fade-in">
                <div className="main-mobile-city-group-title">PUNE HUBS</div>
                {CITIES.filter(c => c.startsWith('Pune')).map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`main-mobile-city-item ${c === selectedCity ? 'active' : ''}`}
                    onClick={() => {
                      handleSelectCity(c);
                      setMobileCityOpen(false);
                    }}
                  >
                    <MapPin size={13} />
                    <span>{c}</span>
                    {c === selectedCity && <CheckCircle2 size={14} color="#ff5e14" style={{ marginLeft: 'auto' }} />}
                  </button>
                ))}

                <div className="main-mobile-city-group-title" style={{ marginTop: '6px' }}>BENGALURU HUBS</div>
                {CITIES.filter(c => c.startsWith('Bengaluru')).map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`main-mobile-city-item ${c === selectedCity ? 'active' : ''}`}
                    onClick={() => {
                      handleSelectCity(c);
                      setMobileCityOpen(false);
                    }}
                  >
                    <MapPin size={13} />
                    <span>{c}</span>
                    {c === selectedCity && <CheckCircle2 size={14} color="#ff5e14" style={{ marginLeft: 'auto' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`main-mobile-link ${location.pathname === '/' ? 'active' : ''}`}>
            <HomeIcon size={18} />
            <span>Home</span>
          </Link>
          {user && user.role !== 'admin' && (
            <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className={`main-mobile-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
              <Bike size={18} />
              <span>My Bookings</span>
            </Link>
          )}
          {user?.role !== 'admin' && (
            <>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={`main-mobile-link ${location.pathname === '/about' ? 'active' : ''}`}>
                <InfoIcon size={18} />
                <span>About Us</span>
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className={`main-mobile-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                <PhoneIcon size={18} />
                <span>Contact</span>
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="main-mobile-link" style={{ color: '#ff5e14', fontWeight: 'bold' }}>
              <ShieldIcon size={18} />
              <span>Dashboard 🚀</span>
            </Link>
          )}

          <div className="main-mobile-divider"></div>

          {user ? (
            <div className="main-mobile-user-section">
              <div className="main-mobile-user-card">
                <div className="nav-avatar-circle" style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px' }}>
                  <img 
                    src={getAvatarUrl()} 
                    alt={user.name || 'User'} 
                    className="nav-avatar-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop';
                    }}
                  />
                </div>
                <div className="main-mobile-user-details">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="main-mobile-user-actions">
                {user.role !== 'admin' && (
                  <button 
                    onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }} 
                    className="main-mobile-btn-profile"
                  >
                    <UserIcon size={15} />
                    <span>My Profile</span>
                  </button>
                )}
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="main-mobile-btn-logout"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
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
