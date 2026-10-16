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

    </div>
  );
};

export default ContactPage;
