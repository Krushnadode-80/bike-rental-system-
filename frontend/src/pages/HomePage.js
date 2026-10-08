import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { CheckCircle2, ShieldCheck, UploadCloud, Bike as BikeIcon, X, ArrowLeft } from 'lucide-react';
import '../Home.css'; // Import the new Home styles
import Chatbot from '../components/Chatbot';
import BikeImage from '../components/BikeImage';
import toast from 'react-hot-toast';
import { bookingDatesSchema, fileUploadSchema, kycSchema, otpSchema, validateWithToast } from '../validation/schemas';

const HomePage = () => {
  const { user, uploadKYC, updateProfile, sendOTP, verifyOTP, refreshUser } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priceRange, setPriceRange] = useState('');

  // Modal Control
  const [selectedBike, setSelectedBike] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(0); // 0=Profile, 1=Rental Info, 2=Payment, 3=Confirmation
  const [rentalType, setRentalType] = useState('daily'); // 'daily' or 'hourly'

  // Booking Flow State
  const [bookingDate, setBookingDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('18:00');
  const [totalPrice, setTotalPrice] = useState(0);
  const [durationDays, setDurationDays] = useState(1);
  const [durationHours, setDurationHours] = useState(0);
  const [bookingError, setBookingError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Digital Payment State
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, verifying, confirmed

  // KYC Verification Form State (Inside Modal)
  const [kycName, setKycName] = useState('');
  const [kycPhone, setKycPhone] = useState('');
  const [kycAadhaar, setKycAadhaar] = useState('');
  const [kycAddress, setKycAddress] = useState('');
  const [aadhaarError, setAadhaarError] = useState(null);
  
  // KYC Upload URLs/State
  const [uploadedProfileUrl, setUploadedProfileUrl] = useState('');
  const [uploadedAadhaarUrl, setUploadedAadhaarUrl] = useState('');
  const [uploadedPanUrl, setUploadedPanUrl] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const resBikes = await client.get('/bikes');
      setBikes(Array.isArray(resBikes.data) ? resBikes.data : []);
      
      if (user) {
        // Prep KYC initial form values
        setKycName(user.name || '');
        setKycPhone(user.phone || '');
        setKycAadhaar(user.aadhaar_number || '');
        setKycAddress(user.address || '');
        setOtpVerified(user.is_verified || false);
        setUploadedProfileUrl(user.profile_photo || '');
        setUploadedAadhaarUrl(user.aadhaar_doc || '');
        setUploadedPanUrl(user.pan_card || '');
      }
    } catch (err) {
      console.error("Error fetching homepage records:", err);
      toast.error('Could not load bikes. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Calculate rental pricing dynamically
  useEffect(() => {
    if (bookingDate && returnDate && selectedBike) {
      if (rentalType === 'daily') {
        const start = new Date(bookingDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        setDurationDays(diffDays);
        setDurationHours(0);
        setTotalPrice(diffDays * selectedBike.price_per_day);
      } else {
        const start = new Date(`${bookingDate}T${pickupTime}`);
        const end = new Date(`${returnDate}T${returnTime}`);
        const diffTime = end - start;
        const hours = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60))); // At least 1 hour
        setDurationHours(hours);
        setDurationDays(0);
        // Fallback to daily / 24 if hourly price isn't explicitly set
        const hourlyRate = selectedBike.price_per_hour || Math.ceil(selectedBike.price_per_day / 24);
        setTotalPrice(hours * hourlyRate);
      }
    }
  }, [bookingDate, returnDate, pickupTime, returnTime, selectedBike, rentalType]);

  // Client side filters
  const filteredBikes = bikes.filter(bike => {
    const matchesSearch = bike.bike_name.toLowerCase().includes(search.toLowerCase()) || 
                          bike.brand.toLowerCase().includes(search.toLowerCase());
                          
    let matchesStatus = true;
    if (statusFilter === 'Available') {
      matchesStatus = bike.availability.toLowerCase().includes('avail');
    } else if (statusFilter === 'Booked') {
      matchesStatus = !bike.availability.toLowerCase().includes('avail');
    }

    const matchesPrice = !priceRange || bike.price_per_day <= parseInt(priceRange);

    return matchesSearch && matchesStatus && matchesPrice;
  });

  // Start Booking Flow
  const handleOpenBookingModal = (bike) => {
    // If the bike is booked, do nothing
    if (!bike.availability.toLowerCase().includes('avail')) return;

    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check KYC status on open
    const isKycComplete = user && user.aadhaar_number && user.address && user.phone && user.profile_photo && user.pan_card && user.aadhaar_doc && user.is_verified;
    
    setSelectedBike(bike);
    setShowBookingModal(true);
    setBookingStep(isKycComplete ? 1 : 0);
    setBookingError(null);
    setIsProcessingPayment(false);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setReturnDate('');
    setPickupTime('09:00');
    setReturnTime('18:00');
    setPaymentStatus('pending');
  };

  // KYC and Payment functions remain exactly the same
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setAadhaarError(null);
    
    const validatedKyc = validateWithToast(kycSchema, {
      name: kycName, phone: kycPhone, aadhaar: kycAadhaar, address: kycAddress,
    });
    if (!validatedKyc) {
      setAadhaarError(null);
      return;
    }
    setAadhaarError(null);

    try {
      await updateProfile({
        name: validatedKyc.name,
        aadhaar_number: validatedKyc.aadhaar,
        address: validatedKyc.address,
        phone: validatedKyc.phone
      });
      await refreshUser();
      toast.success('Profile details saved successfully.');
    } catch (err) {
      toast.error("Profile update failed: " + err);
    }
  };

  const handleFileUpload = async (type, file) => {
    if (!file || !validateWithToast(fileUploadSchema(type), file)) return;
    try {
      const res = await uploadKYC(type, file);
      if (type === 'profile') setUploadedProfileUrl(res.url);
      if (type === 'aadhaar') setUploadedAadhaarUrl(res.url);
      if (type === 'pan_card') setUploadedPanUrl(res.url);
      await refreshUser();
      toast.success('Document uploaded successfully.');
    } catch (err) {
      toast.error("Upload failed: " + err);
    }
  };

  const handleSendOTP = async () => {
    setOtpError(null);
    try {
      await sendOTP();
      setOtpSent(true);
      toast.success('Verification code sent to your email.');
    } catch (err) {
      setOtpError(err);
      toast.error(String(err));
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError(null);
    const validatedOtp = validateWithToast(otpSchema, otpCode);
    if (!validatedOtp) {
      setOtpError('Enter the 6-digit verification code.');
      return;
    }
    try {
      await verifyOTP(validatedOtp);
      setOtpVerified(true);
      await refreshUser();
      toast.success('Email verified successfully.');
    } catch (err) {
      setOtpError(err);
      toast.error(String(err));
    }
  };

  const handleInitiateCheckout = async () => {
    setBookingError(null);
    const validBooking = validateWithToast(bookingDatesSchema, {
      bookingDate, returnDate, pickupTime, returnTime, rentalType,
    });
    if (!validBooking) {
      setBookingError('Check the pickup and return date and time.');
      return;
    }
    setBookingStep(2); // Move to Payment step
  };

  const handleConfirmPayment = async () => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    setPaymentStatus('verifying');
    
    try {
      // 1. Create order on backend
      const orderRes = await client.post('/create-order', { amount: totalPrice });
      const order = orderRes.data.order;

      // 2. Initialize Razorpay
      const options = {
        key: "rzp_test_SpmwJjd4Zinz8T",
        amount: order.amount,
        currency: order.currency,
        name: "MotorCity Premium Rentals",
        description: `Booking for ${selectedBike.bike_name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            await client.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // If verification successful, create the booking
            const payload = {
              user_email: user.email,
              bike_name: selectedBike.bike_name,
              booking_date: bookingDate,
              return_date: returnDate,
              total_price: totalPrice,
              image_url: selectedBike.image_url,
              status: "Booked",
              rental_type: rentalType === 'hourly' ? "Hourly" : "Daily",
              duration: rentalType === 'hourly' ? `${durationHours} Hours` : `${durationDays} Days`,
              payment_status: "Paid"
            };

            await client.post('/book-bike', payload);
            setPaymentStatus('confirmed');
            toast.success('Payment confirmed and your bike is booked!');
            
            setTimeout(() => {
              setBookingStep(3); // Move to Confirmation step
              setTimeout(() => {
                setShowBookingModal(false);
                navigate('/my-bookings');
              }, 3000);
            }, 1000);

          } catch (err) {
            const message = err.response?.data?.detail || "Verification failed after payment.";
            setBookingError(message);
            toast.error(message);
            setIsProcessingPayment(false);
            setPaymentStatus('pending');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ""
        },
        theme: {
          color: "#ff5e14"
        }
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response){
        const message = "Payment failed: " + response.error.description;
        setBookingError(message);
        toast.error(message);
        setIsProcessingPayment(false);
        setPaymentStatus('pending');
      });

      rzp1.open();
    } catch (err) {
      const message = "Failed to initiate Razorpay checkout. " + (err.response?.data?.detail || err.message);
      setBookingError(message);
      toast.error(message);
      setIsProcessingPayment(false);
      setPaymentStatus('pending');
    }
  };

  const isKycComplete = user && 
    user.aadhaar_number && 
    user.address && 
    user.phone && 
    user.profile_photo && 
    user.pan_card && 
    user.aadhaar_doc && 
    user.is_verified;

  return (
    <div className="home-page">
      
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Anywhere</h1>
          <p>Choose from premium bikes and enjoy your ride. We provide the most reliable and affordable rental services in the city.</p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={() => {
              const el = document.getElementById('bikes-collection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>Explore Bikes</button>
            <button className="btn-hero-secondary" onClick={() => navigate('/about#how-it-works')}>How It Works</button>
          </div>
        </div>
      </section>

      {/* Floating Filter Bar */}
      <div className="floating-filter-container">
        <div className="filter-group">
          <label className="filter-label">Search Name/Brand</label>
          <div className="filter-input-wrap">
            <input 
              type="text" 
              maxLength={100}
              placeholder="Royal Enfield, Yamaha..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Availability</label>
          <div className="filter-input-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
            </select>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Max Budget (₹)</label>
          <div className="filter-input-wrap">
            <input 
              type="number" 
              min={0}
              max={1000000}
              step={1}
              placeholder="e.g. 2000" 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <h2 id="bikes-collection" className="section-title">Our Premium Collection</h2>

      {/* Bikes Grid */}
      <div className="bikes-grid-container">
        <div className="bikes-grid-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading catalog...</div>
          ) : filteredBikes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No bikes found matching your filters.</div>
          ) : (
            <div className="bikes-grid">
              {filteredBikes.map(bike => {
                const isAvailable = bike.availability.toLowerCase().includes('avail');
                
                return (
                  <div key={bike.id} className="bike-card">
                    <div className="bike-card-img-wrap">
                      <BikeImage
                        src={bike.image_url}
                        alt={bike.bike_name} 
                        className="bike-card-img" 
                      />
                    </div>
                    
                    <div className="bike-card-content">
                      <div className="bike-card-header">
                        <h3 className="bike-card-title">{bike.bike_name}</h3>
                        <span className={`status-badge ${isAvailable ? 'status-available' : 'status-booked'}`}>
                          {isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </div>
                      
                      <div className="bike-card-specs">
                        Brand: {bike.brand} | Model: {bike.bike_name}
                      </div>

                      <div className="specs-grid">
                        <div className="spec-item">
                          <span className="spec-label">ENGINE:</span>
                          <span className="spec-value">{bike.engine || '150cc'}</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">MILEAGE:</span>
                          <span className="spec-value">{bike.mileage || '45 kmpl'}</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">TORQUE:</span>
                          <span className="spec-value">{bike.torque || '14 Nm'}</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">FUEL:</span>
                          <span className="spec-value">{bike.fuel_tank || '12L'}</span>
                        </div>
                      </div>

                      <div className="bike-card-price">
                        ₹{bike.price_per_day}<span>/day</span>
                      </div>

                      {user?.role === 'admin' ? (
                        <button 
                          className={`btn-book ${isAvailable ? 'available' : 'booked'}`}
                          disabled={true}
                          style={{ cursor: 'default', opacity: 0.9 }}
                        >
                          {isAvailable ? 'Available' : 'Booked'}
                        </button>
                      ) : (
                        <button 
                          className={`btn-book ${isAvailable ? 'available' : 'booked'}`}
                          onClick={() => handleOpenBookingModal(bike)}
                          disabled={!isAvailable}
                        >
                          {isAvailable ? 'Book Now' : 'Booked'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* NEW REDESIGNED BOOKING MODAL */}
      {showBookingModal && selectedBike && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-wrapper">
            
            {/* LEFT SIDEBAR */}
            <div className="booking-sidebar">
              <div className="booking-sidebar-header">
                <BikeIcon size={24} color="#ff5e14" />
                <span>Booking Details</span>
              </div>
              
              <div className="booking-toggle">
                <button 
                  className={`booking-toggle-btn ${rentalType === 'daily' ? 'active' : ''}`}
                  onClick={() => setRentalType('daily')}
                >
                  Daily
                </button>
                <button 
                  className={`booking-toggle-btn ${rentalType === 'hourly' ? 'active' : ''}`}
                  onClick={() => setRentalType('hourly')}
                >
                  Hourly
                </button>
              </div>

              <div className="booking-steps">
                <div className={`booking-step-item ${bookingStep === 0 ? 'active' : (bookingStep > 0 ? 'completed' : '')}`}>Profile</div>
                <div className={`booking-step-item ${bookingStep === 1 ? 'active' : (bookingStep > 1 ? 'completed' : '')}`}>Rental Info</div>
                <div className={`booking-step-item ${bookingStep === 2 ? 'active' : (bookingStep > 2 ? 'completed' : '')}`}>Payment</div>
                <div className={`booking-step-item ${bookingStep === 3 ? 'active success' : ''}`}>Confirmation</div>
              </div>

              <div className="booking-sidebar-footer">
                <div className="booking-sidebar-footer-title">Total Amount</div>
                <div className="booking-sidebar-total">₹{totalPrice > 0 ? totalPrice : selectedBike.price_per_day}</div>
              </div>
            </div>

            {/* RIGHT MAIN CONTENT */}
            <div className="booking-main-content">
              <button className="booking-close-btn" onClick={() => setShowBookingModal(false)}>
                <X size={18} />
              </button>

              {/* STEP 0: PROFILE / KYC */}
              {bookingStep === 0 && (
                <div className="booking-step-content">
                  <h2 className="booking-main-title">Profile & KYC</h2>
                  <p className="booking-main-subtitle">Please verify your documents before renting.</p>
                  
                  {!isKycComplete ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '8px', color: '#fbbf24' }}>
                        <ShieldCheck size={24} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px' }}>KYC is required for your first booking.</span>
                      </div>

                      {/* 1. Email OTP Verification */}
                      {!otpVerified ? (
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>1. Verify Email First</h4>
                          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Please verify your email ({user.email}) to proceed with KYC.</p>
                          {otpError && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>{String(otpError)}</div>}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {otpSent ? (
                              <>
                                <input type="text" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" className="cc-input" placeholder="6-digit OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ flex: 1 }} />
                                <button onClick={handleVerifyOTP} className="cc-pay-btn" style={{ flex: 1, padding: '12px', marginTop: 0 }}>Verify</button>
                              </>
                            ) : (
                              <button onClick={handleSendOTP} className="cc-pay-btn" style={{ padding: '12px', marginTop: 0 }}>Send Verification OTP</button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={20} color="#10b981" />
                          <h4 style={{ fontWeight: 800, color: '#10b981', margin: 0 }}>1. Email Verified</h4>
                        </div>
                      )}

                      {otpVerified && (
                        <>
                          {/* 2. Document Uploads */}
                          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>2. Upload Documents</h4>
                            <div className="kyc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                              <label className="kyc-box" style={{ background: '#ffffff', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                {uploadedProfileUrl ? <CheckCircle2 color="#10b981" style={{ margin: '0 auto' }} /> : <UploadCloud color="#94a3b8" style={{ margin: '0 auto' }} />}
                                <span style={{ fontSize: '11px', display: 'block', marginTop: '4px', fontWeight: 700 }}>Profile Photo</span>
                                <span style={{ fontSize: '10px', color: uploadedProfileUrl ? '#10b981' : '#ef4444' }}>{uploadedProfileUrl ? 'Uploaded' : 'Not Uploaded'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => { handleFileUpload('profile', e.target.files[0]); e.target.value = ''; }} />
                              </label>
                              <label className="kyc-box" style={{ background: '#ffffff', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                {uploadedAadhaarUrl ? <CheckCircle2 color="#10b981" style={{ margin: '0 auto' }} /> : <UploadCloud color="#94a3b8" style={{ margin: '0 auto' }} />}
                                <span style={{ fontSize: '11px', display: 'block', marginTop: '4px', fontWeight: 700 }}>Aadhaar Doc</span>
                                <span style={{ fontSize: '10px', color: uploadedAadhaarUrl ? '#10b981' : '#ef4444' }}>{uploadedAadhaarUrl ? 'Uploaded' : 'Not Uploaded'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={(e) => { handleFileUpload('aadhaar', e.target.files[0]); e.target.value = ''; }} />
                              </label>
                              <label className="kyc-box" style={{ background: '#ffffff', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                {uploadedPanUrl ? <CheckCircle2 color="#10b981" style={{ margin: '0 auto' }} /> : <UploadCloud color="#94a3b8" style={{ margin: '0 auto' }} />}
                                <span style={{ fontSize: '11px', display: 'block', marginTop: '4px', fontWeight: 700 }}>PAN Card</span>
                                <span style={{ fontSize: '10px', color: uploadedPanUrl ? '#10b981' : '#ef4444' }}>{uploadedPanUrl ? 'Uploaded' : 'Not Uploaded'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={(e) => { handleFileUpload('pan_card', e.target.files[0]); e.target.value = ''; }} />
                              </label>
                            </div>
                          </div>

                          {/* 3. Personal Details */}
                          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>3. Personal Details</h4>
                            <form onSubmit={handleProfileSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>PHONE</label>
                                  <input type="tel" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="Enter a 10-digit Indian mobile number" className="cc-input" placeholder="10-digit phone number" value={kycPhone} onChange={(e) => setKycPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required />
                                </div>
                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>AADHAAR</label>
                                  <input type="text" inputMode="numeric" pattern="[0-9]{12}" title="Enter a 12-digit Aadhaar number" className="cc-input" placeholder="12-digit Aadhaar" value={kycAadhaar} onChange={(e) => { setKycAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12)); setAadhaarError(null); }} maxLength={12} required />
                                  {aadhaarError && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>{aadhaarError}</div>}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>FULL ADDRESS</label>
                                <input type="text" maxLength={300} className="cc-input" placeholder="Permanent Address" value={kycAddress} onChange={(e) => setKycAddress(e.target.value)} required />
                              </div>
                              <button type="submit" className="cc-pay-btn" style={{ padding: '12px' }}>Save Profile Details</button>
                            </form>
                          </div>
                        </>
                      )}
                      
                      <button onClick={() => setBookingStep(1)} className="cc-pay-btn" disabled={!isKycComplete} style={{ background: isKycComplete ? '#10b981' : '#94a3b8' }}>
                        {isKycComplete ? 'Continue to Rental Info' : 'Complete KYC to Continue'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                      <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 20px auto' }} />
                      <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Your Profile is fully verified!</h3>
                      <button onClick={() => setBookingStep(1)} className="cc-pay-btn">Proceed to Rental Info</button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1: RENTAL INFO */}
              {bookingStep === 1 && (
                <div className="booking-step-content">
                  <h2 className="booking-main-title">Rental Info</h2>
                  <p className="booking-main-subtitle">Select dates for your {selectedBike.bike_name} reservation.</p>

                  {bookingError && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>{bookingError}</div>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: rentalType === 'hourly' ? '1fr 1fr' : '1fr', gap: '10px' }}>
                      <div>
                        <label className="cc-form-label">Pickup Date</label>
                        <input type="date" className="cc-input" min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                      </div>
                      {rentalType === 'hourly' && (
                        <div>
                          <label className="cc-form-label">Pickup Time</label>
                          <input type="time" className="cc-input" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: rentalType === 'hourly' ? '1fr 1fr' : '1fr', gap: '10px' }}>
                      <div>
                        <label className="cc-form-label">Expected Return</label>
                        <input type="date" className="cc-input" min={bookingDate || new Date().toISOString().split('T')[0]} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                      </div>
                      {rentalType === 'hourly' && (
                        <div>
                          <label className="cc-form-label">Return Time</label>
                          <input type="time" className="cc-input" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
                        </div>
                      )}
                    </div>

                    {bookingDate && returnDate && (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                          <span style={{ color: '#64748b' }}>Rate:</span>
                          <strong>₹{rentalType === 'hourly' ? (selectedBike.price_per_hour || Math.ceil(selectedBike.price_per_day / 24)) : selectedBike.price_per_day}/{rentalType === 'hourly' ? 'hour' : 'day'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span style={{ color: '#64748b' }}>Duration:</span>
                          <strong>{rentalType === 'hourly' ? `${durationHours} Hours` : `${durationDays} Days`}</strong>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button onClick={() => setBookingStep(0)} className="cc-input" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button onClick={handleInitiateCheckout} className="cc-pay-btn" style={{ flex: 2, marginTop: 0 }}>Proceed to Payment</button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT (MODERN DIGITAL WALLET DESIGN) */}
              {bookingStep === 2 && (
                <div className="booking-step-content">
                  <h2 className="booking-main-title">Secure Checkout</h2>
                  <p className="booking-main-subtitle">Choose your preferred digital payment method.</p>

                  <div className="billing-summary-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '16px', color: '#ffffff', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                      <ShieldCheck size={120} />
                    </div>
                    <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Billing Summary</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}>
                      <span style={{ color: '#cbd5e1' }}>Base Fare ({rentalType === 'hourly' ? `${durationHours} hrs` : `${durationDays} days`})</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px' }}>
                      <span style={{ color: '#cbd5e1' }}>Taxes & Fees</span>
                      <span style={{ color: '#10b981' }}>Included</span>
                    </div>
                    <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 800 }}>
                      <span>Total Amount</span>
                      <span style={{ color: '#fbbf24' }}>₹{totalPrice}</span>
                    </div>
                  </div>

                  {paymentStatus === 'verifying' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', margin: '16px 0', color: '#ff5e14', fontWeight: 600 }}>
                      <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #ff5e14', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                      Securely verifying payment details...
                    </div>
                  )}
                  {paymentStatus === 'confirmed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', margin: '16px 0', color: '#10b981', fontWeight: 600 }}>
                      <CheckCircle2 size={20} />
                      Payment Verified & Secured!
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => setBookingStep(1)} className="cc-input" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} disabled={isProcessingPayment}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button 
                      onClick={handleConfirmPayment} 
                      className="cc-pay-btn" 
                      style={{ flex: 2, marginTop: 0, background: paymentStatus === 'confirmed' ? '#10b981' : undefined }} 
                      disabled={isProcessingPayment}
                    >
                      {paymentStatus === 'verifying' ? "Processing..." : paymentStatus === 'confirmed' ? "Confirmed" : `Pay ₹${totalPrice}`}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRMATION */}
              {bookingStep === 3 && (
                <div className="booking-step-content" style={{ textAlign: 'center', paddingTop: '40px' }}>
                  <CheckCircle2 size={80} color="#10b981" style={{ margin: '0 auto 20px auto' }} />
                  <h2 className="booking-main-title" style={{ color: '#10b981' }}>Booking Confirmed!</h2>
                  <p className="booking-main-subtitle">Your ride is reserved. Redirecting to your bookings...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
};

export default HomePage;
