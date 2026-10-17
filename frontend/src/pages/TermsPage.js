import React from 'react';

const TermsPage = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 80px)', padding: '60px 20px', transition: 'background-color 0.3s ease' }}>
      <div style={{ 
        maxWidth: '860px', 
        margin: '0 auto', 
        backgroundColor: 'var(--bg-card)', 
        padding: 'clamp(24px, 5vw, 48px)', 
        borderRadius: '20px', 
        border: '1px solid var(--border-color)', 
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        color: 'var(--text-main)', 
        fontFamily: 'Inter, sans-serif' 
      }}>
        <h1 style={{ color: 'var(--brand-orange)', fontSize: '32px', fontWeight: 800, marginBottom: '20px' }}>Terms & Conditions</h1>
        <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
          Welcome to MotorCity Bike Rental. By accessing or using our services, you agree to be bound by these Terms and Conditions. Please review them carefully before initiating any rental reservation.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '28px', marginBottom: '10px' }}>1. Use of Services & Rider Eligibility</h3>
        <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '18px' }}>
          You must be at least 18 years old and hold a valid government-issued driver's license (where applicable to motorcycle class) to rent any vehicle. You agree to provide accurate, verified KYC documentation during registration.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '28px', marginBottom: '10px' }}>2. Booking, Deposit & Payments</h3>
        <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '18px' }}>
          All bookings are subject to real-time fleet availability. Payment must be completed prior to handover. We reserve the right to decline bookings or request additional security validation if suspicious activity is detected.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '28px', marginBottom: '10px' }}>3. Vehicle Care, Fuel & Return Policy</h3>
        <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '18px' }}>
          You agree to return the vehicle on or before the scheduled return time in the same mechanical condition as dispatched. Late returns without prior renewal may incur standard hourly overtime rates.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '28px', marginBottom: '10px' }}>4. Safety & Rider Liability</h3>
        <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '18px' }}>
          MotorCity Bike Rental prioritizes your safety. Helmets must be worn by both rider and pillion passenger at all times. Riders are strictly required to adhere to state traffic regulations and municipal speed limits.
        </p>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>
          Last updated: October 2026 · MotorCity Rentals Compliance Team
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
