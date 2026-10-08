import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Bike, Shield, Headphones, Eye, EyeOff } from 'lucide-react';
import '../Auth.css';
import toast from 'react-hot-toast';
import { loginSchema, validateWithToast } from '../validation/schemas';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const isAdminLogin = useLocation().pathname === '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isFilled = (val) => val.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateWithToast(loginSchema, { email, password })) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.role === 'admin') {
          navigate('/dashboard');
          return;
        }
      }
      navigate('/');
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Invalid credentials. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-split-layout">
      {/* Left Panel - Image & Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <Bike size={32} color="#fff" />
            <h1>Bike <span>Rental</span></h1>
            <p>Your Journey Starts Here</p>
          </div>
          
          <h2>Join our<br />community.</h2>
          <p className="auth-desc">
            Unlock the freedom of the road with the city's premier bike rental experience. Join thousands of riders today.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="icon-container">
                <Bike size={24} />
              </div>
              <span className="feature-label">Premium Bikes</span>
            </div>
            <div className="auth-feature">
              <div className="icon-container">
                <Shield size={24} />
              </div>
              <span className="feature-label">Safe & Secure</span>
            </div>
            <div className="auth-feature">
              <div className="icon-container">
                <Headphones size={24} />
              </div>
              <span className="feature-label">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h3>{isAdminLogin ? 'Admin Login' : 'Welcome Back'}</h3>
          <p className="subtitle">
            {isAdminLogin ? 'Sign in with your administrator account.' : 'Please enter your credentials to continue.'}
          </p>

          {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="premium-form-group">
              <label>EMAIL ADDRESS</label>
              <div className={`premium-input-wrapper ${isFilled(email) ? 'active' : ''}`}>
                <Mail size={18} />
                <input
                  type="email"
                  maxLength={254}
                  className={`premium-input ${isFilled(email) ? 'active' : ''}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="premium-form-group" style={{ marginBottom: '16px' }}>
              <label>PASSWORD</label>
              <div className={`premium-input-wrapper ${isFilled(password) ? 'active' : ''}`}>
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={128}
                  className={`premium-input ${isFilled(password) ? 'active' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {showPassword ? (
                  <EyeOff size={18} className="password-toggle-icon" onClick={() => setShowPassword(false)} />
                ) : (
                  <Eye size={18} className="password-toggle-icon" onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div className="terms-checkbox" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <span style={{ color: '#ff5e14', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Forgot?</span>
            </div>

            <button type="submit" className="premium-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="auth-switch">
              Don't have an account? <Link to="/register" style={{ color: '#ff5e14' }}>Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
