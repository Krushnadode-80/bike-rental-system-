import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, Bike, Shield, Headphones, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import client from '../api/client';
import toast from 'react-hot-toast';
import '../Auth.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email Request, 2: OTP & New Password Verification
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isFilled = (val) => val.length > 0;

  // Step 1: Send OTP to user's email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (loading) return; // Prevent double submission
    setError(null);

    if (!email.trim()) {
      toast.error('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/forgot-password/send-otp', { email: email.trim() });
      toast.success(res.data.message || 'OTP sent successfully to your email.');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to send OTP. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password in PostgreSQL DB
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      toast.error('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/forgot-password/reset', {
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword,
      });
      toast.success(res.data.message || 'Password reset successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reset password. Please check your OTP and try again.';
      setError(msg);
      toast.error(msg);
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

          <h2>Account<br />Recovery.</h2>
          <p className="auth-desc">
            Reset your password securely in a few simple steps and get back on the road.
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
          <div style={{ marginBottom: '20px' }}>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>

          <h3>Forgot Password</h3>
          <p className="subtitle">
            {step === 1
              ? 'Enter your registered email address to receive a verification OTP code.'
              : `Enter the 6-digit OTP sent to ${email} and set your new password.`}
          </p>

          {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

          {step === 1 ? (
            /* Step 1 Form - Email Request */
            <form onSubmit={handleSendOtp} noValidate>
              <div className="premium-form-group" style={{ marginBottom: '28px' }}>
                <label>REGISTERED EMAIL ADDRESS</label>
                <div className={`premium-input-wrapper ${isFilled(email) ? 'active' : ''}`}>
                  <Mail size={18} />
                  <input
                    type="email"
                    maxLength={254}
                    className={`premium-input ${isFilled(email) ? 'active' : ''}`}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="premium-btn verify-btn-effect verify-btn-pulse" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                    Sending OTP Email...
                  </span>
                ) : 'Send Verification OTP'}
              </button>

              <div className="auth-switch" style={{ marginTop: '24px' }}>
                Remembered your password? <Link to="/login" style={{ color: '#ff5e14' }}>Sign in</Link>
              </div>
            </form>
          ) : (
            /* Step 2 Form - OTP & New Password */
            <form onSubmit={handleResetPassword} noValidate>
              <div className="premium-form-group">
                <label>ENTER 6-DIGIT OTP</label>
                <div className={`premium-input-wrapper ${isFilled(otp) ? 'active' : ''}`}>
                  <KeyRound size={18} />
                  <input
                    type="text"
                    maxLength={6}
                    className={`premium-input ${isFilled(otp) ? 'active' : ''}`}
                    placeholder="Enter 6-digit OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="premium-form-group">
                <label>NEW PASSWORD</label>
                <div className={`premium-input-wrapper ${isFilled(newPassword) ? 'active' : ''}`}>
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={128}
                    className={`premium-input ${isFilled(newPassword) ? 'active' : ''}`}
                    placeholder="Enter new password (min. 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  {showPassword ? (
                    <EyeOff size={18} className="password-toggle-icon" onClick={() => setShowPassword(false)} />
                  ) : (
                    <Eye size={18} className="password-toggle-icon" onClick={() => setShowPassword(true)} />
                  )}
                </div>
              </div>

              <div className="premium-form-group" style={{ marginBottom: '28px' }}>
                <label>CONFIRM NEW PASSWORD</label>
                <div className={`premium-input-wrapper ${isFilled(confirmPassword) ? 'active' : ''}`}>
                  <Lock size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    maxLength={128}
                    className={`premium-input ${isFilled(confirmPassword) ? 'active' : ''}`}
                    placeholder="Confirm your new password"
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

              <button type="submit" className="premium-btn verify-btn-effect" disabled={loading}>
                {loading ? 'Updating Password...' : 'Reset Password & Save'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
                >
                  Change Email Address
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#ff5e14', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
