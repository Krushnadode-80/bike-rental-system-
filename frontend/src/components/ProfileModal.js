import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, ShieldCheck, CheckCircle2, AlertCircle, X, Camera, Heart } from 'lucide-react';
import '../Home.css';
import './ProfileModal.css';
import toast from 'react-hot-toast';
import { profileSchema, fileUploadSchema, validateWithToast } from '../validation/schemas';
import { getMediaUrl } from '../api/client';

const ProfileModal = ({ onClose }) => {
  const { user, updateProfile, uploadKYC, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [likedCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bike_saved_favorites') || '[]').length;
    } catch {
      return 0;
    }
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const getAvatarUrl = () => {
    if (user?.profile_photo) {
      return getMediaUrl(user.profile_photo);
    }
    return '/default-avatar.png';
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const validated = validateWithToast(fileUploadSchema('profile'), file);
    if (!validated) return;

    setIsUploadingImage(true);
    try {
      await uploadKYC('profile', file);
      if (refreshUser) await refreshUser();
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      const errText = typeof err === 'string' ? err : 'Failed to upload photo';
      toast.error(errText);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateWithToast(profileSchema, { name, phone, address })) return;
    try {
      await updateProfile({ name, phone, address });
      toast.success('Profile updated successfully.');
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Failed to update profile.';
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!user) return null;

  const isKycComplete = user.aadhaar_number && user.address && user.phone && user.profile_photo && user.is_verified;

  return (
    <div className="profile-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="profile-modal-container">

        {/* Header */}
        <div className="profile-modal-header">
          <div>
            <h2 className="profile-modal-title">My Profile</h2>
            <p className="profile-modal-subtitle">Manage your account and verification status</p>
          </div>
          <button onClick={onClose} className="profile-modal-close-btn" aria-label="Close Profile">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="profile-modal-body">

          {/* User Profile Card (Left on Desktop, Top on Mobile) */}
          <div className="profile-user-card">
            
            {/* Avatar & Camera Trigger */}
            <div className="profile-user-card-avatar-wrap">
              <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 6px auto' }}>
                <img
                  src={getAvatarUrl()}
                  alt={user.name || 'User'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                    border: '2.5px solid var(--brand-orange)',
                    boxShadow: '0 3px 10px rgba(255, 94, 20, 0.25)'
                  }}
                />

                <label
                  htmlFor="profile-modal-image-input"
                  title="Upload profile photo"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#ff5e14',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isUploadingImage ? 'wait' : 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    border: '2px solid var(--bg-card)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {isUploadingImage ? (
                    <span className="spinner" style={{ width: '9px', height: '9px', border: '1.5px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Camera size={11} />
                  )}
                  <input
                    id="profile-modal-image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                    disabled={isUploadingImage}
                  />
                </label>
              </div>

              <label
                htmlFor="profile-modal-image-input"
                style={{
                  fontSize: '10.5px',
                  color: 'var(--brand-orange)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                {isUploadingImage ? 'Uploading...' : (user.profile_photo ? 'Change Photo' : 'Upload Photo')}
              </label>
            </div>

            {/* User Info & Status Badges */}
            <div className="profile-user-card-info">
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-main)' }}>{user.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '0 0 8px 0', wordBreak: 'break-all' }}>{user.email}</p>
              
              <div className="profile-badges-row">
                <div style={{ padding: '3.5px 8px', backgroundColor: user.admin_verified ? '#dcfce3' : 'var(--bg-main)', color: user.admin_verified ? '#10b981' : 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '14px', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {user.admin_verified ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {user.admin_verified ? 'Admin Verified' : 'Standard User'}
                </div>

                <div style={{ padding: '3.5px 8px', backgroundColor: isKycComplete ? '#dcfce3' : '#fff7ed', color: isKycComplete ? '#059669' : '#c2410c', border: `1px solid ${isKycComplete ? '#bbf7d0' : '#fed7aa'}`, borderRadius: '14px', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {isKycComplete ? <CheckCircle2 size={11} /> : <ShieldCheck size={11} />}
                  {isKycComplete ? 'KYC Verified' : 'KYC Incomplete'}
                </div>
              </div>

              {user.role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/liked-bikes');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    marginTop: '10px',
                    padding: '7px 12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Heart size={13} fill="#ef4444" color="#ef4444" />
                  <span>My Liked Bikes ({likedCount})</span>
                </button>
              )}
            </div>

          </div>

          {/* Right Card: Personal Details */}
          <div className="profile-details-card">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Personal Details</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ padding: '5px 12px', backgroundColor: 'var(--brand-orange)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <div style={{ backgroundColor: '#dcfce3', color: '#10b981', padding: '6px 10px', borderRadius: '6px', marginBottom: '10px', fontWeight: 600, fontSize: '11px' }}>
                {message}
              </div>
            )}

            {!isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Full Name</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                    <User size={13} color="var(--brand-orange)" /> {user.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Phone Number</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                    <Phone size={13} color="var(--brand-orange)" /> {user.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Address</label>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                    <MapPin size={13} color="var(--brand-orange)" style={{ marginTop: '2px', flexShrink: 0 }} /> {user.address || 'Not provided'}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="tel" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="Enter a 10-digit Indian mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={13} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
                    <textarea maxLength={300} value={address} onChange={(e) => setAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '7px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ flex: 1.5, backgroundColor: 'var(--brand-orange)', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'box-shadow 0.2s' }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 10px rgba(255,94,20,0.3)'} onMouseOut={(e) => e.target.style.boxShadow = 'none'}>
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

