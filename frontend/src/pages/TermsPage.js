import React from 'react';

const TermsPage = () => {
  return (
    <div style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: '#ff5e14', marginBottom: '24px' }}>Terms & Conditions</h1>
      <p style={{ lineHeight: '1.6', color: '#a1a1aa', marginBottom: '16px' }}>
        Welcome to Bike Rental. By accessing or using our services, you agree to be bound by these Terms and Conditions. Please read them carefully.
      </p>
      
      <h3 style={{ marginTop: '32px', marginBottom: '12px' }}>1. Use of Services</h3>
      <p style={{ lineHeight: '1.6', color: '#a1a1aa', marginBottom: '16px' }}>
        You must be at least 18 years old and hold a valid driver's license (if applicable to the vehicle type) to rent a vehicle from us. You agree to provide accurate, current, and complete information during the registration process.
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '12px' }}>2. Booking and Payments</h3>
      <p style={{ lineHeight: '1.6', color: '#a1a1aa', marginBottom: '16px' }}>
        All bookings are subject to availability. Payment must be made in full at the time of booking or pick-up. We reserve the right to cancel bookings if payment is not received or if suspicious activity is detected.
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '12px' }}>3. Vehicle Care and Return</h3>
      <p style={{ lineHeight: '1.6', color: '#a1a1aa', marginBottom: '16px' }}>
        You agree to return the vehicle in the same condition it was rented, normal wear and tear excepted. Late returns may be subject to additional fees. Any damages incurred during the rental period are the sole responsibility of the renter.
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '12px' }}>4. Liability</h3>
      <p style={{ lineHeight: '1.6', color: '#a1a1aa', marginBottom: '16px' }}>
        Bike Rental is not liable for any personal injury, property damage, or loss sustained by the renter or third parties during the use of our rented vehicles. Riders are encouraged to wear helmets and follow all local traffic laws.
      </p>

      <p style={{ marginTop: '48px', fontSize: '14px', color: '#71717a' }}>
        Last updated: May 2026
      </p>
    </div>
  );
};

export default TermsPage;
