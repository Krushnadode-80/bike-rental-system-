import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Home.css';
import toast from 'react-hot-toast';
import { profileSchema, validateWithToast } from '../validation/schemas';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateWithToast(profileSchema, { name, phone, address })) return;
    try {
      await updateProfile({ name, phone, address });
      toast.success('Profile updated successfully.');
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update profile.');
      setMessage('Failed to update profile.');
    }
  };

  if (!user) return null;

  const isKycComplete = user.aadhaar_number && user.address && user.phone && user.profile_photo && user.is_verified;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '60px 20px', color: '#1e293b' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>My Profile</h1>
          <p style={{ fontSize: '16px', color: '#64748b' }}>Manage your account settings and KYC verification status.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          
          {/* Left Column - User Info & KYC */}
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* User Card */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#ff5e14', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '36px', fontWeight: 800, marginBottom: '20px' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{user.name}</h2>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '20px' }}>{user.email}</p>
              
              <div style={{ padding: '8px 16px', backgroundColor: user.admin_verified ? '#dcfce3' : '#f1f5f9', color: user.admin_verified ? '#10b981' : '#64748b', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {user.admin_verified ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {user.admin_verified ? 'Admin Verified' : 'Standard User'}
              </div>
            </div>

            {/* KYC Status Card */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#ff5e14" />
                KYC Verification Status
              </h3>
              
              {isKycComplete ? (
                <div style={{ padding: '16px', backgroundColor: '#dcfce3', border: '1px solid #10b981', borderRadius: '12px', color: '#059669', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={24} style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Verified & Ready to Ride</h4>
                    <p style={{ fontSize: '13px', opacity: 0.9 }}>Your documents and profile are fully verified. You can book any bike instantly without delays.</p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', color: '#c2410c', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <AlertCircle size={24} style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Action Required</h4>
                    <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '12px' }}>You need to complete your KYC process during your first booking checkout to rent a bike.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Edit Profile Form */}
          <div style={{ flex: '1 1 500px', backgroundColor: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '30px' }}>Personal Details</h3>
            
            {message && (
              <div style={{ backgroundColor: '#dcfce3', color: '#10b981', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 600, fontSize: '14px' }}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpdate} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} 
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="Enter a 10-digit Indian mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} 
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Permanent Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }} />
                  <textarea 
                    maxLength={300}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="3"
                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box' }} 
                    placeholder="Enter your full address"
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                style={{ marginTop: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', padding: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1e293b'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#0f172a'}
              >
                Save Changes
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
