import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bike, Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  // Hide footer on auth, admin, and dashboard layouts
  if (
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/admin' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/dashboard'
  ) {
    return null;
  }

  const handleScrollTo = (targetPath, targetHash = null) => {
    if (location.pathname === targetPath) {
      if (targetHash) {
        const el = document.getElementById(targetHash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer-wrapper">
      {/* 1. DOWNLOAD MOBILE APP BANNER */}
      <section className="app-download-section">
        <div className="app-download-container">
          <h2 className="app-download-title">Download Our Mobile App</h2>
          <p className="app-download-subtitle">
            For a better experience, download our app now and enjoy exclusive offers,
            faster ordering, and personalized recommendations.
          </p>

          <div className="app-download-badges">
            {/* Apple App Store Button */}
            <a
              href="#app-store"
              className="app-badge-btn"
              onClick={(e) => e.preventDefault()}
              aria-label="Download on the App Store"
            >
              <div className="app-badge-icon">
                <svg width="22" height="26" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.69-14-4.89-7.53-8.84-16.14-11.87-25.84-3.02-9.71-4.54-19.14-4.54-28.3 0-14.07 3.65-26.01 10.96-35.82 7.31-9.81 16.59-14.81 27.84-15 4.9 0 10.12 1.25 15.67 3.75 5.54 2.5 9.4 3.81 11.58 3.94 1.74-.24 5.75-1.63 12.03-4.16 6.28-2.54 11.75-3.68 16.42-3.44 12.56.76 22.78 5.65 30.65 14.67-11.02 6.64-16.42 15.77-16.19 27.4.23 9.15 3.76 16.92 10.6 23.32 6.84 6.4 14.77 10.05 23.8 10.95-2.07 6.1-4.71 12.39-7.92 18.89zm-38.35-103.54c0-7.31 2.65-14.28 7.95-20.91 5.3-6.63 11.73-10.74 19.3-12.33.65 2.18.98 4.36.98 6.54 0 7.3-2.73 14.24-8.19 20.82-5.45 6.58-12.01 10.64-19.67 12.18-.22-2.18-.37-4.28-.37-6.3z" />
                </svg>
              </div>
              <div className="app-badge-text">
                <span className="app-badge-small">Download on the</span>
                <span className="app-badge-big">App Store</span>
              </div>
            </a>

            {/* Google Play Store Button */}
            <a
              href="#google-play"
              className="app-badge-btn"
              onClick={(e) => e.preventDefault()}
              aria-label="GET IT ON Google Play"
            >
              <div className="app-badge-icon">
                <svg width="22" height="24" viewBox="0 0 512 512">
                  <path fill="#4285F4" d="M47.7 21.6C44.3 25.3 42.4 30.9 42.4 38v436c0 7.1 1.9 12.7 5.3 16.4l2.6 2.6L274.6 268.7v-5.4L50.3 19 47.7 21.6z"/>
                  <path fill="#FBBC04" d="M352.4 346.5l-77.8-77.8v-5.4l77.8-77.8 1.8 1 92.1 52.3c26.3 14.9 26.3 39.3 0 54.3l-92.1 52.4-1.8 1z"/>
                  <path fill="#EA4335" d="M354.2 345.5L274.6 266 50.3 490.3c8.7 9.2 23 10.3 39.2 1.2l264.7-146"/>
                  <path fill="#34A853" d="M354.2 166.5L89.5 16.2C73.3 7.1 59 8.2 50.3 17.4L274.6 246l79.6-79.5z"/>
                </svg>
              </div>
              <div className="app-badge-text">
                <span className="app-badge-small">GET IT ON</span>
                <span className="app-badge-big">Google Play</span>
              </div>
            </a>
          </div>

          <p className="app-download-caption">Available on iOS and Android devices</p>
        </div>
      </section>

      {/* 2. MAIN 4-COLUMN FOOTER */}
      <div className="main-footer">
        <div className="main-footer-container">
          <div className="footer-columns-grid">
            {/* Column 1: Brand Info */}
            <div className="footer-brand-col">
              <Link to="/" onClick={() => handleScrollTo('/')} className="footer-logo">
                <Bike size={26} className="footer-logo-icon" />
                <span>BIKE<span className="accent">RENTAL</span></span>
              </Link>
              <p className="footer-brand-desc">
                Delivering delicious rides and top-tier bikes right to your doorstep with love and care.
                Your safety and satisfaction is our highest priority.
              </p>
              <div className="footer-social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Twitter">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-nav-col">
              <h3 className="footer-column-title">
                <Link to="/" onClick={() => handleScrollTo('/')}>Quick Links</Link>
              </h3>
              <ul className="footer-links-list">
                <li className="footer-link-item">
                  <Link to="/" onClick={() => handleScrollTo('/')}>Home</Link>
                </li>
                <li className="footer-link-item">
                  <Link to="/#bikes-collection" onClick={() => handleScrollTo('/', 'bikes-collection')}>Menu / Fleet</Link>
                </li>
                <li className="footer-link-item">
                  <Link to="/about" onClick={() => handleScrollTo('/about')}>About Us</Link>
                </li>
                <li className="footer-link-item">
                  <Link to="/contact" onClick={() => handleScrollTo('/contact')}>Contact</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div className="footer-nav-col">
              <h3 className="footer-column-title">
                <Link to="/contact" onClick={() => handleScrollTo('/contact')}>Customer Service</Link>
              </h3>
              <ul className="footer-links-list">
                <li className="footer-link-item">
                  <Link to="/contact" onClick={() => handleScrollTo('/contact')}>Help Center</Link>
                </li>
                <li className="footer-link-item">
                  <Link to="/my-bookings" onClick={() => handleScrollTo('/my-bookings')}>Track Order</Link>
                </li>
                <li className="footer-link-item">
                  <Link to="/terms" onClick={() => handleScrollTo('/terms')}>Returns & Policies</Link>
                </li>
                <li className="footer-link-item">
                  <Link to="/about#how-it-works" onClick={() => handleScrollTo('/about', 'how-it-works')}>FAQ</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div className="footer-contact-col">
              <h3 className="footer-column-title">Contact Info</h3>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <Phone size={16} className="footer-contact-icon" />
                  <span className="footer-contact-text">
                    <a href="tel:+15551234567">+1 (555) 123-4567</a>
                  </span>
                </div>
                <div className="footer-contact-item">
                  <Mail size={16} className="footer-contact-icon" />
                  <span className="footer-contact-text">
                    <a href="mailto:info@bikerental.com">info@bikerental.com</a>
                  </span>
                </div>
                <div className="footer-contact-item">
                  <MapPin size={16} className="footer-contact-icon" />
                  <span className="footer-contact-text">
                    123 Riding Street, Motor City, State 12345
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright and Legal Links */}
          <div className="footer-bottom-bar">
            <div>© {new Date().getFullYear()} Bike Rental. All rights reserved.</div>
            <div className="footer-bottom-links">
              <Link to="/terms">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/terms">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
