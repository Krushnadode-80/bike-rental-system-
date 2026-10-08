import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReceiptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  // Get booking from local storage for new tabs
  const bookingStr = localStorage.getItem('receipt_' + id);
  const booking = bookingStr ? JSON.parse(bookingStr) : null;

  useEffect(() => {
    // Add print styles to head when component mounts
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          margin: 0; /* Removes browser headers and footers */
          size: auto;
        }
        body {
          margin: 0;
          padding: 0;
          background-color: white !important;
        }
        body * {
          visibility: hidden;
        }
        #printable-receipt, #printable-receipt * {
          visibility: visible;
        }
        #printable-receipt {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          max-width: 600px;
          margin: 0;
          padding: 20px;
          box-shadow: none !important;
          page-break-inside: avoid;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Receipt not found.</h2>
        <button onClick={() => navigate('/my-bookings')} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>Back to My Bookings</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div className="no-print" style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/my-bookings')} 
          style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }}
        >
          <ArrowLeft size={18} /> Back to Garage
        </button>
      </div>

      <div id="printable-receipt" style={{ width: '100%', maxWidth: '600px', background: 'white', color: '#1e293b', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
        
        <div style={{ backgroundColor: '#0f172a', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '2px', margin: 0 }}>DIGITAL RECEIPT</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>MotorCity Premium Rentals</p>
        </div>

        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b', margin: 0, fontWeight: 700 }}>Total Amount</p>
            <h2 style={{ fontSize: '56px', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>₹{booking.total_price}</h2>
            <span style={{ display: 'inline-block', background: '#dcfce3', color: '#10b981', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
              {booking.payment_status || 'PAID IN FULL'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Booking Reference</span>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>#BR-{booking.id}9382</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Vehicle Class</span>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{booking.bike_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Rental Period</span>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{booking.booking_date} to {booking.return_date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Rider Account</span>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{user?.email || booking.user_email || 'Guest Rider'}</span>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
             <p style={{ fontFamily: 'monospace', fontSize: '40px', letterSpacing: '2px', color: '#1e293b', margin: 0 }}>||| || ||| | || |||</p>
             <p style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '4px', margin: '4px 0 0 0' }}>{booking.id}9382MCR</p>
          </div>

          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handlePrint} style={{ width: '100%', padding: '20px', backgroundColor: '#ff5e14', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(255,94,20,0.3)', transition: 'transform 0.2s' }}>
              <Download size={22} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
