import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';
import '../Home.css';
import toast from 'react-hot-toast';
import { profileSchema, validateWithToast } from '../validation/schemas';

const ProfileModal = ({ onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div style={{ width: 'calc(100% - 32px)', maxWidth: '680px', backgroundColor: '#f8fafc', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(15,23,42,0.28)', position: 'relative', maxHeight: '88vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ backgroundColor: '#0f172a', padding: '20px 26px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '23px', fontWeight: 800 }}>My Profile</h2>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Manage your account and verification status</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>

          {/* Left Column */}
          <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ff5e14', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px', fontWeight: 800, margin: '0 auto 12px auto' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0' }}>{user.name}</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>{user.email}</p>
              <div style={{ padding: '6px 12px', backgroundColor: user.admin_verified ? '#dcfce3' : '#f1f5f9', color: user.admin_verified ? '#10b981' : '#64748b', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {user.admin_verified ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {user.admin_verified ? 'Admin Verified' : 'Standard User'}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#ff5e14" /> KYC Status
              </h4>
              {isKycComplete ? (
                <div style={{ padding: '12px', backgroundColor: '#dcfce3', borderRadius: '10px', color: '#059669', display: 'flex', gap: '10px' }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Verified & Ready to Ride</p>
                </div>
              ) : (
                <div style={{ padding: '12px', backgroundColor: '#fff7ed', borderRadius: '10px', color: '#c2410c', display: 'flex', gap: '10px' }}>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Incomplete. Verify during checkout.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div style={{ flex: '2 1 280px', backgroundColor: '#fff', padding: '22px', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Personal Details</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <div style={{ backgroundColor: '#dcfce3', color: '#10b981', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, fontSize: '13px' }}>
                {message}
              </div>
            )}

            {!isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                    <User size={16} color="#64748b" /> {user.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                    <Phone size={16} color="#64748b" /> {user.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Address</label>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                    <MapPin size={16} color="#64748b" style={{ marginTop: '2px' }} /> {user.address || 'Not provided'}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="text" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type="tel" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="Enter a 10-digit Indian mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                    <textarea maxLength={300} value={address} onChange={(e) => setAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ flex: 2, backgroundColor: '#ff5e14', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'box-shadow 0.2s' }} onMouseOver={(e) => e.target.style.boxShadow = '0 6px 15px rgba(255,94,20,0.3)'} onMouseOut={(e) => e.target.style.boxShadow = 'none'}>
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
