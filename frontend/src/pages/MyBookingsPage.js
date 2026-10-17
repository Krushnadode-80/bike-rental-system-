import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Calendar, Trash2, CheckCircle2, XCircle, Clock, Download, MapPin, AlertCircle } from 'lucide-react';
import '../Home.css';
import './MyBookings.css';
import toast from 'react-hot-toast';
import BikeImage from '../components/BikeImage';

import { Link } from 'react-router-dom';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      if (user) {
        const res = await client.get(`/my-bookings/${user.email}`);
        setBookings(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Error fetching rider bookings:", err);
      setError("Failed to load your booking history.");
      toast.error('Failed to load your booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelBooking = async (id) => {
    const check = window.confirm("Are you sure you want to cancel this booking reservation?");
    if (!check) return;

    setCancellingId(id);
    try {
      await client.delete(`/cancel-booking/${id}`);
      toast.success("Booking cancelled successfully. Refund processed.");
      await fetchBookings();
    } catch (err) {
      toast.error("Failed to cancel booking: " + (err.response?.data?.detail || "System error."));
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-receipt-card');
    if (!element || !window.html2pdf) return;

    // Temporarily move the element to the top level of the body to ensure perfect capture
    const originalParent = element.parentNode;
    const originalNextSibling = element.nextSibling;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = window.scrollY + 'px';
    wrapper.style.left = '0';
    wrapper.style.width = '100%';
    wrapper.style.zIndex = '999999';
    wrapper.style.background = '#f1f5f9';
    wrapper.style.padding = '40px';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';

    wrapper.appendChild(element);
    document.body.appendChild(wrapper);

    // Hide close button temporarily
    const closeBtn = element.querySelector('button');
    if (closeBtn) closeBtn.style.display = 'none';

    // Configure html2pdf options for high quality output
    const opt = {
      margin: 0.2,
      filename: `MotorCity_Receipt_BR-${selectedInvoice.id}9X.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, logging: false, y: window.scrollY, scrollY: window.scrollY },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save().then(() => {
      // Restore
      if (closeBtn) closeBtn.style.display = '';
      if (originalNextSibling) {
        originalParent.insertBefore(element, originalNextSibling);
      } else {
        originalParent.appendChild(element);
      }
      document.body.removeChild(wrapper);
      toast.success('Receipt downloaded successfully.');
    }).catch(err => {
      console.error('PDF generation failed:', err);
      toast.error('Could not generate the receipt PDF. Please try again.');
      // Restore on error
      if (closeBtn) closeBtn.style.display = '';
      originalParent.appendChild(element);
      if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
    });
  };

  const getStatusStyle = (status) => {
    if (status === 'Booked') return { bg: '#dcfce3', color: '#10b981', icon: <CheckCircle2 size={15} /> };
    if (status === 'Cancelled') return { bg: '#fee2e2', color: '#ef4444', icon: <XCircle size={15} /> };
    return { bg: '#fef3c7', color: '#d97706', icon: <Clock size={15} /> };
  };

  return (
    <div className="my-bookings-page">

      {/* Dark Premium Compact Hero Header */}
      <div className="my-bookings-hero">
        <h1 className="my-bookings-hero-title">My Garage</h1>
        <p className="my-bookings-hero-sub">
          Access your digital boarding passes, track active rides, and manage your reservation history.
        </p>
      </div>

      <div className="my-bookings-container">

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #ff5e14', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px auto' }}></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '14px' }}>Syncing your rides...</p>
          </div>
        ) : error ? (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px 20px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={28} style={{ margin: '0 auto 10px auto' }} />
            <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '50px 24px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '72px', height: '72px', backgroundColor: 'rgba(255, 94, 20, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 18px auto' }}>
              <Calendar size={36} color="#ff5e14" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>No Rides Scheduled</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px', maxWidth: '380px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              Your garage is currently empty. Book a premium motorcycle and start your next adventure today!
            </p>
            <Link to="/" style={{ backgroundColor: '#ff5e14', color: '#fff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', display: 'inline-block', boxShadow: '0 6px 16px rgba(255, 94, 20, 0.3)' }}>
              Explore Fleet
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bookings.map(booking => {
              const statusStyle = getStatusStyle(booking.status);
              const isActive = booking.status === 'Booked';
              const qrData = encodeURIComponent(`Bike: ${booking.bike_name} | ID: BR-${booking.id}9X | Dates: ${booking.booking_date} to ${booking.return_date || booking.booking_date} | Amount: Rs.${booking.total_price} | Status: ${booking.status}`);

              return (
                /* Compact VIP Digital Ticket Card */
                <div key={booking.id} className="booking-ticket-card">

                  {/* Left Side: Image & Brand */}
                  <div className="booking-ticket-img-wrap">
                    <div className="booking-ticket-overlay"></div>
                    <BikeImage
                      src={booking.image_url}
                      alt={booking.bike_name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="booking-ticket-content-over">
                      <span className="booking-pass-pill">
                        {isActive ? 'Active Pass' : 'Expired Pass'}
                      </span>
                      <div>
                        <h2 className="booking-ticket-title">{booking.bike_name}</h2>
                        <p className="booking-ticket-class">VIP Rental Class</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Ticket Details */}
                  <div className="booking-ticket-details">
                    {/* Cutout notches for ticket effect */}
                    <div className="booking-cutout-top"></div>
                    <div className="booking-cutout-bottom"></div>

                    <div className="booking-dates-row">
                      <div className="booking-date-block">
                        <p className="booking-date-label">Pickup Date</p>
                        <p className="booking-date-val">{booking.booking_date}</p>
                      </div>
                      <div className="booking-date-block right">
                        <p className="booking-date-label">Return Date</p>
                        <p className="booking-date-val">{booking.return_date || booking.booking_date}</p>
                      </div>
                    </div>

                    <div className="booking-location-row">
                      <MapPin size={16} color="#ff5e14" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Headquarters, Motor City Garage</span>
                    </div>

                    <div className="booking-footer-row">
                      <div>
                        <p className="booking-date-label">Total Amount</p>
                        <p className="booking-amount-val">₹{booking.total_price}</p>
                      </div>
                      <span style={{ padding: '5px 12px', backgroundColor: statusStyle.bg, color: statusStyle.color, borderRadius: '20px', fontSize: '11.5px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {statusStyle.icon} {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Ticket Stub / Actions */}
                  <div className="booking-ticket-stub">
                    <div className="booking-ticket-stub-left">
                      <div className="booking-qr-box">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${qrData}`}
                          alt="Scan for Details"
                          className="booking-qr-img"
                          style={{ width: '56px', height: '56px', display: 'block' }}
                        />
                      </div>
                      <p className="booking-id-tag">ID: BR-{booking.id}9X</p>
                    </div>

                    <div className="booking-stub-actions">
                      <button
                        onClick={() => setSelectedInvoice(booking)}
                        className="booking-btn-receipt"
                      >
                        <Download size={13} /> Receipt
                      </button>

                      {isActive && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="booking-btn-cancel"
                          disabled={cancellingId === booking.id}
                          style={{
                            opacity: cancellingId === booking.id ? 0.7 : 1,
                            cursor: cancellingId === booking.id ? 'wait' : 'pointer'
                          }}
                        >
                          {cancellingId === booking.id ? (
                            <>
                              <span 
                                className="spinner" 
                                style={{ 
                                  width: '12px', 
                                  height: '12px', 
                                  border: '2px solid #ffffff', 
                                  borderTopColor: 'transparent', 
                                  borderRadius: '50%', 
                                  display: 'inline-block',
                                  animation: 'spin 1s linear infinite' 
                                }} 
                              />
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 size={13} /> Cancel
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Improved Modal with Automatic PDF Download */}
        {selectedInvoice && (
          <div style={{ position: 'fixed', inset: 0, boxSizing: 'border-box', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 23, 42, 0.8)', overflowY: 'auto', padding: '82px 20px 18px' }}>

            <div style={{ width: '100%', maxWidth: '550px', position: 'relative', animation: 'fadeInUp 0.3s ease-out', margin: '0 auto', flexShrink: 0 }}>

              {/* The Ultra-Premium Receipt element that gets converted to PDF */}
              <div id="invoice-receipt-card" style={{ background: '#fff', color: '#1e293b', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }}>

                {/* Close Button Inside Receipt Corner */}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  data-html2canvas-ignore="true"
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '36px', height: '36px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                >
                  <XCircle size={24} />
                </button>

                {/* Background Watermark */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', opacity: 0.03, pointerEvents: 'none', zIndex: 0 }}>
                  <Calendar size={320} color="#0f172a" />
                </div>

                {/* Luxury Header */}
                <div style={{ backgroundColor: '#0f172a', padding: '22px 26px', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
                  <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '90px', height: '90px', background: 'radial-gradient(circle, #ff5e14 0%, transparent 70%)', opacity: 0.3 }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '2px', margin: 0, color: '#fff', textTransform: 'uppercase' }}>Invoice</h3>
                      <p style={{ color: '#ff5e14', fontSize: '12px', marginTop: '4px', fontWeight: 800, letterSpacing: '1px' }}>MOTORCITY PREMIUM RENTALS</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Booking Date</p>
                      <p style={{ color: '#fff', fontSize: '14px', margin: '3px 0 0 0', fontWeight: 700 }}>{new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '22px 26px', position: 'relative', zIndex: 1 }}>

                  {/* Status Stamp */}
                  <div style={{ position: 'absolute', top: '16px', right: '30px', transform: 'rotate(15deg)', border: `4px solid ${selectedInvoice.status === 'Cancelled' ? '#ef4444' : '#10b981'}`, color: selectedInvoice.status === 'Cancelled' ? '#ef4444' : '#10b981', padding: '6px 20px', borderRadius: '10px', fontSize: '20px', fontWeight: 900, letterSpacing: '3px', opacity: 0.8 }}>
                    {selectedInvoice.status === 'Cancelled' ? 'CANCELLED' : (selectedInvoice.payment_status || 'PAID')}
                  </div>

                  {/* Rider & Booking Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px' }}>
                    <div>
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', margin: '0 0 6px 0', fontWeight: 800 }}>Customer Name</p>
                      <p style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 3px 0' }}>{user?.name || user?.email || 'VIP Guest'}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{user?.email || selectedInvoice.user_email}</p>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: '60px' }}> {/* right margin to avoid stamp overlap */}
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', margin: '0 0 6px 0', fontWeight: 800 }}>Booking ID</p>
                      <p style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 3px 0' }}>BR-{selectedInvoice.id}9382X</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Status: {selectedInvoice.status === 'Cancelled' ? 'Cancelled' : 'Confirmed'}</p>
                    </div>
                  </div>

                  {/* Rental Details Table */}
                  <div style={{ marginBottom: '22px', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', backgroundColor: '#f8fafc', padding: '12px 18px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ flex: 2, fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Bike Name</div>
                      <div style={{ flex: 1.5, fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Dates</div>
                      <div style={{ flex: 1, fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Total</div>
                    </div>

                    <div style={{ display: 'flex', padding: '16px 18px', alignItems: 'center' }}>
                      <div style={{ flex: 2 }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>{selectedInvoice.bike_name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Premium Rental</p>
                      </div>
                      <div style={{ flex: 1.5, textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        {selectedInvoice.booking_date} <br /> to <br /> {selectedInvoice.return_date || selectedInvoice.booking_date}
                      </div>
                      <div style={{ flex: 1, textAlign: 'right', fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                        ₹{selectedInvoice.total_price}
                      </div>
                    </div>
                  </div>

                  {/* Total Amount Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ padding: '6px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <img
                          src={`https://barcode.tec-it.com/barcode.ashx?data=BR-${selectedInvoice.id}9382X&code=Code128&translate-esc=on`}
                          alt="Barcode"
                          style={{ height: '34px', width: 'auto', display: 'block' }}
                        />
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', margin: 0 }}>SCAN TO VERIFY</p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', margin: '0 0 6px 0', fontWeight: 800 }}>{selectedInvoice.status === 'Cancelled' ? 'Refund Processed' : 'Total Paid'}</p>
                      <h2 style={{ fontSize: '38px', fontWeight: 900, color: '#ff5e14', margin: 0 }}>₹{selectedInvoice.total_price}</h2>
                    </div>

                  </div>

                  {/* Footer Terms */}
                  <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '14px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 3px 0', fontWeight: 600 }}>Thank you for riding with MotorCity Premium Rentals.</p>
                    <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>Contact: support@motorcity.com | Roadside Assistance: 1800-RIDE-NOW</p>
                  </div>

                </div>
              </div>

              {/* Download Button (Outside the receipt so it doesn't print) */}
              <button
                onClick={handleDownloadPDF}
                style={{ width: '100%', boxSizing: 'border-box', marginTop: '14px', padding: '14px', backgroundColor: '#ff5e14', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(255,94,20,0.3)', transition: 'transform 0.2s' }}
              >
                <Download size={22} /> Download PDF Invoice
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBookingsPage;
