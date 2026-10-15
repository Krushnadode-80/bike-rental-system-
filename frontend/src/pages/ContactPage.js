import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, Loader2, Bike, ChevronRight } from 'lucide-react';
import '../Home.css';
import toast from 'react-hot-toast';
import { contactSchema, validateWithToast } from '../validation/schemas';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateWithToast(contactSchema, formData)) return;
    setIsSending(true);

    // Simulate sending delay
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      toast.success('Message sent successfully. We will get back to you shortly.');
      setTimeout(() => setSent(false), 5000);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', color: 'var(--text-main)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '40px 20px', flex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#ff5e14', marginBottom: '12px' }}>Get In Touch</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            We're here to help you 24/7.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>

          {/* Contact Info */}
          <div style={{ flex: '1 1 350px', backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Contact Information</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '10px', backgroundColor: '#fff7ed', borderRadius: '10px', color: '#ff5e14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '0.2px' }}>Our Headquarters</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>123 Riding Avenue, Motor City<br />Maharashtra 400001, India</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '10px', backgroundColor: '#fff7ed', borderRadius: '10px', color: '#ff5e14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '0.2px' }}>Call Us 24/7</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>+91 8055405020<br />+91 7028246875 (Toll Free)</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', backgroundColor: '#fff7ed', borderRadius: '10px', color: '#ff5e14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '0.2px' }}>Email Us</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>support@bikerental.com<br />krushnadode5gmail.com.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ flex: '1 1 450px', backgroundColor: 'var(--bg-card)', padding: '30px 40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Send us a Message</h3>

            {sent && (
              <div style={{ backgroundColor: '#dcfce3', color: 'var(--text-main)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 600 }}>
                Message sent successfully! We will get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Your Name</label>
                  <input
                    type="text"
                    maxLength={100}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                    placeholder="John Doe"
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Email Address</label>
                  <input
                    type="email"
                    maxLength={254}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Subject</label>
                <input
                  type="text"
                  maxLength={120}
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' }}
                  placeholder="How can we help you?"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Message</label>
                <textarea
                  required
                  rows="4"
                  maxLength={2000}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '14px', resize: 'vertical', transition: 'border-color 0.2s' }}
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSending}
                style={{
                  marginTop: '8px',
                  backgroundColor: isSending ? '#f97316' : '#ff5e14',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'opacity 0.2s',
                  opacity: isSending ? 0.8 : 1
                }}
              >
                {isSending ? (
                  <>
                    Sending...
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  </>
                ) : (
                  <>Send Message <Send size={16} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Inline animation style for the spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Footer Section */}
      <footer style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', paddingTop: '60px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between' }}>

          {/* Brand Column */}
          <div style={{ flex: '1 1 250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#fff' }}>
              <Bike size={28} color="#ff5e14" />
              <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0, letterSpacing: '1px' }}>Bike Rental</h2>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', color: '#94a3b8' }}>
              Your trusted partner for premium bike rentals. Ride more, worry less with our reliable service.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1877F2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1DA1F2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0A66C2', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div style={{ flex: '1 1 150px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Home', 'Browse Bikes', 'My Bookings', 'About Us', 'Contact Us'].map(link => (
                <li key={link} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s' }}>
                  <ChevronRight size={14} color="#64748b" />
                  <span onMouseOver={(e) => e.target.style.color = '#ff5e14'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>{link}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Bikes Column */}
          <div style={{ flex: '1 1 200px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Popular Bikes</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Royal Enfield Classic 350', 'Yamaha R15 V4', 'KTM Duke 390', 'Honda Activa 6G'].map(bike => (
                <li key={bike} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s' }}>
                  <ChevronRight size={14} color="#64748b" />
                  <span onMouseOver={(e) => e.target.style.color = '#ff5e14'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>{bike}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div style={{ flex: '1 1 150px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Support</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Help Center', 'Terms & Conditions', 'Privacy Policy', 'Cancellation Policy'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s' }}>
                  <ChevronRight size={14} color="#64748b" />
                  <span onMouseOver={(e) => e.target.style.color = '#ff5e14'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div style={{ flex: '1 1 200px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Contact Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Phone size={18} color="#ff5e14" style={{ marginTop: '2px' }} />
                <span style={{ fontSize: '14px' }}>+91 8055405020</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Mail size={18} color="#ff5e14" style={{ marginTop: '2px' }} />
                <span style={{ fontSize: '14px' }}>support@bikerental.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={18} color="#ff5e14" style={{ marginTop: '2px', minWidth: '18px' }} />
                <span style={{ fontSize: '14px', lineHeight: '1.5' }}>123 Riding Avenue, Motor City,<br />Maharashtra 400001, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '50px', padding: '24px 20px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          © 2025 Bike Rental. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
