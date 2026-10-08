import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bike, Shield, Clock, Award } from 'lucide-react';
import '../Home.css'; // Reuse existing styles

const AboutPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#how-it-works') {
      const element = document.getElementById('how-it-works');
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#1e293b' }}>

      {/* Full Width Hero Section */}

      <div style={{
        textAlign: 'center',
        padding: '160px 20px',
        background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://images.unsplash.com/photo-1558980663-3685c1d673c4?q=80&w=1920") no-repeat center center/cover',
        color: '#ffffff',
        marginBottom: '80px'
      }}>
        <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#ffffff', marginBottom: '20px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Our Journey</h1>
        <p style={{ fontSize: '20px', color: '#f1f5f9', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6', textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
          We started with a simple idea: making high-quality, perfectly maintained bikes accessible to everyone who wants to experience the thrill of the open road and nature.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

        {/* Content Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', marginBottom: '100px' }}>
          <div style={{ flex: '1 1 500px' }}>
            <img
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200"
              alt="Premium Bike"
              style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            />
          </div>
          <div style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '20px' }}>Driven By Passion</h2>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', marginBottom: '24px' }}>
              Since our founding in 2020, Bike Rental has grown from a local startup into the city's premier destination for two-wheeled adventures. We carefully curate our fleet, ensuring every single motorcycle and scooter meets our rigorous standards for performance, safety, and style.
            </p>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8' }}>
              Whether you're exploring the coastal highways, navigating the bustling city streets, or just escaping for the weekend, we provide the perfect companion for your journey.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 800, marginBottom: '40px' }}>Why Choose Us</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>

          <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <Bike size={28} color="#ff5e14" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Premium Fleet</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>We offer only the best brands. Fully serviced and ready to ride.</p>
          </div>

          <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <Shield size={28} color="#ff5e14" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Fully Insured</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>Comprehensive insurance coverage included with every rental for your peace of mind.</p>
          </div>

          <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <Clock size={28} color="#ff5e14" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>24/7 Support</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>Our roadside assistance and customer support team is always just a call away.</p>
          </div>

          <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <Award size={28} color="#ff5e14" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Best Prices</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>Transparent, competitive pricing with absolutely zero hidden fees.</p>
          </div>

        </div>

        {/* How It Works Section */}
        <div id="how-it-works" style={{ marginTop: '100px', marginBottom: '100px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 800, marginBottom: '40px' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', position: 'relative' }}>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#ff5e14', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', fontSize: '24px', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(255, 94, 20, 0.3)' }}>1</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Choose Your Ride</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Browse our premium collection and pick the perfect bike for your journey.</p>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#ff5e14', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', fontSize: '24px', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(255, 94, 20, 0.3)' }}>2</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Book & Verify</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Complete a quick KYC and secure your booking with our safe digital payment.</p>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#ff5e14', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', fontSize: '24px', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(255, 94, 20, 0.3)' }}>3</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Hit The Road</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Pick up your bike at the scheduled time and enjoy your adventure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
