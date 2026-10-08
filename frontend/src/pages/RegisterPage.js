import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Bike, Shield, Headphones, Eye, EyeOff } from 'lucide-react';
import '../Auth.css'; // Import our new premium styles
import toast from 'react-hot-toast';
import { registerSchema, validateWithToast } from '../validation/schemas';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Active state handlers to mimic the white background for filled inputs
  const isFilled = (val) => val.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const validation = validateWithToast(registerSchema, { name, email, phone, password, confirmPassword, agreed });
    if (!validation) return;

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully. Please sign in.');
      navigate('/login'); // Redirect to Login Page
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Registration failed.';
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
          <h3>Create Account</h3>
          <p className="subtitle">Start your journey with us in just a few steps.</p>

          {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label>Full Name</label>
                <div className={`premium-input-wrapper ${isFilled(name) ? 'active' : ''}`}>
                  <User size={18} />
                  <input type="text" maxLength={100} className={`premium-input ${isFilled(name) ? 'active' : ''}`} placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label>Phone Number</label>
                <div className={`premium-input-wrapper ${isFilled(phone) ? 'active' : ''}`}>
                  <Phone size={18} />
                  <input type="tel" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="Enter a 10-digit Indian mobile number" className={`premium-input ${isFilled(phone) ? 'active' : ''}`} placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required />
                </div>
              </div>
            </div>

            <div className="premium-form-group" style={{ marginTop: '16px' }}>
              <label>Email Address</label>
              <div className={`premium-input-wrapper ${isFilled(email) ? 'active' : ''}`}>
                <Mail size={18} />
                <input type="email" maxLength={254} className={`premium-input ${isFilled(email) ? 'active' : ''}`} placeholder="krushna@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label>Password</label>
                <div className={`premium-input-wrapper ${isFilled(password) ? 'active' : ''}`}>
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    maxLength={128}
                    className={`premium-input ${isFilled(password) ? 'active' : ''}`}
                    placeholder="••••••••"
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

              <div className="premium-form-group" style={{ marginBottom: 0 }}>
                <label>Confirm Password</label>
                <div className={`premium-input-wrapper ${isFilled(confirmPassword) ? 'active' : ''}`}>
                  <Lock size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={8}
                    maxLength={128}
                    className={`premium-input ${isFilled(confirmPassword) ? 'active' : ''}`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {showConfirmPassword ? (
                    <EyeOff size={18} className="password-toggle-icon" onClick={() => setShowConfirmPassword(false)} />
                  ) : (
                    <Eye size={18} className="password-toggle-icon" onClick={() => setShowConfirmPassword(true)} />
                  )}
                </div>
              </div>
            </div>

            <div className="terms-checkbox">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
              />
              <label htmlFor="terms">
                I agree to the <span onClick={() => setShowTerms(true)} style={{ color: '#ff5e14', cursor: 'pointer' }}>Terms & Conditions</span>
              </label>
            </div>

            <button type="submit" className="premium-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>

            <div className="auth-switch" style={{ marginTop: '16px' }}>
              Already have an account? <Link to="/login" style={{ color: '#ff5e14' }}>Login here</Link>
            </div>
          </form>
        </div>
      </div>
      {/* Terms Modal */}
      {showTerms && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#18181b', padding: '32px', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #3f3f46'
          }}>
            <h2 style={{ color: '#fff', marginBottom: '16px' }}>Terms & Conditions</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '12px', lineHeight: '1.5' }}>
              Welcome to Bike Rental. By accessing or using our services, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>
            <h4 style={{ color: '#fff', marginTop: '24px', marginBottom: '8px' }}>1. Use of Services</h4>
            <p style={{ color: '#a1a1aa', marginBottom: '12px', lineHeight: '1.5' }}>
              You must be at least 18 years old and hold a valid driver's license to rent a vehicle from us. You agree to provide accurate information during the registration process.
            </p>
            <h4 style={{ color: '#fff', marginTop: '24px', marginBottom: '8px' }}>2. Booking and Payments</h4>
            <p style={{ color: '#a1a1aa', marginBottom: '12px', lineHeight: '1.5' }}>
              All bookings are subject to availability. Payment must be made in full at the time of booking or pick-up.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button 
                onClick={() => {
                  setAgreed(false);
                  setShowTerms(false);
                }}
                style={{ flex: 1, padding: '12px 24px', backgroundColor: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Disagree
              </button>
              <button 
                onClick={() => {
                  setAgreed(true);
                  setShowTerms(false);
                }}
                style={{ flex: 1, padding: '12px 24px', backgroundColor: '#ff5e14', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
