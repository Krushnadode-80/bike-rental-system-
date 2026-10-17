import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, Loader2 } from 'lucide-react';
import '../Home.css';
import './Contact.css';
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
    }, 1200);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">

        <div className="contact-header">
          <h1 className="contact-title">Get In Touch</h1>
          <p className="contact-subtitle">
            Have questions about rentals or routes? We're here to help you 24/7.
          </p>
        </div>

        <div className="contact-grid">

          {/* Contact Info */}
          <div className="contact-info-card">
            <h3 className="contact-card-title">Contact Information</h3>

            <div className="contact-info-row">
              <div className="contact-info-icon-pill">
                <MapPin size={18} />
              </div>
              <div className="contact-info-details">
                <h4>Our Headquarters</h4>
                <p>123 Riding Avenue, Motor City<br />Maharashtra 400001, India</p>
              </div>
            </div>

            <div className="contact-info-row">
              <div className="contact-info-icon-pill">
                <Phone size={18} />
              </div>
              <div className="contact-info-details">
                <h4>Call Us 24/7</h4>
                <p>+91 8055405020<br />+91 7028246875 (Toll Free)</p>
              </div>
            </div>

            <div className="contact-info-row">
              <div className="contact-info-icon-pill">
                <Mail size={18} />
              </div>
              <div className="contact-info-details">
                <h4>Email Us</h4>
                <p>support@bikerental.com<br />krushnadode5@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            <h3 className="contact-form-title">Send us a Message</h3>

            {sent && (
              <div className="contact-alert-success">
                Message sent successfully! We will get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="contact-form">
              <div className="contact-form-row">
                <div className="contact-field-wrap">
                  <label className="contact-label">Your Name</label>
                  <input
                    type="text"
                    maxLength={100}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="contact-input"
                    placeholder="John Doe"
                  />
                </div>
                <div className="contact-field-wrap">
                  <label className="contact-label">Email Address</label>
                  <input
                    type="email"
                    maxLength={254}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="contact-input"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="contact-field-wrap">
                <label className="contact-label">Subject</label>
                <input
                  type="text"
                  maxLength={120}
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="contact-input"
                  placeholder="How can we help you?"
                />
              </div>

              <div className="contact-field-wrap">
                <label className="contact-label">Message</label>
                <textarea
                  required
                  rows="3"
                  maxLength={2000}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="contact-textarea"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="contact-submit-btn"
              >
                {isSending ? (
                  <>
                    <span>Sending...</span>
                    <Loader2 size={16} className="spinner" />
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
