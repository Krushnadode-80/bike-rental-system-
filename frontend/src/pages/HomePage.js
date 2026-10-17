import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { CheckCircle2, ShieldCheck, UploadCloud, Bike as BikeIcon, X, ArrowLeft, Heart, Star, Check, ChevronDown, AlertCircle } from 'lucide-react';
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
  const [fetchError, setFetchError] = useState(null);

  // New Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priceRange, setPriceRange] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const availabilityDropdownRef = useRef(null);

  // Close Availability dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (availabilityDropdownRef.current && !availabilityDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modal Control
  const [selectedBike, setSelectedBike] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [detailsBike, setDetailsBike] = useState(null);
  const [bookingStep, setBookingStep] = useState(0); // 0=Profile, 1=Rental Info, 2=Payment, 3=Confirmation
  const [rentalType, setRentalType] = useState('daily'); // 'daily' or 'hourly'

  // Saved Wishlist / Favorites
  const [savedFavorites, setSavedFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bike_saved_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const [showOnlyLiked, setShowOnlyLiked] = useState(false);

  useEffect(() => {
    const handleFavoritesSync = (e) => {
      if (e.detail) {
        setSavedFavorites(e.detail);
      } else {
        try {
          setSavedFavorites(JSON.parse(localStorage.getItem('bike_saved_favorites') || '[]'));
        } catch {
          setSavedFavorites([]);
        }
      }
    };
    window.addEventListener('bike_favorites_updated', handleFavoritesSync);
    window.addEventListener('storage', handleFavoritesSync);
    return () => {
      window.removeEventListener('bike_favorites_updated', handleFavoritesSync);
      window.removeEventListener('storage', handleFavoritesSync);
    };
  }, []);

  const handleToggleFavorite = async (e, bike) => {
    e.stopPropagation();
    let updated;
    if (savedFavorites.includes(bike.id)) {
      updated = savedFavorites.filter(id => id !== bike.id);
      toast.success('Removed from liked bikes');
    } else {
      updated = [...savedFavorites, bike.id];
      toast.success('Added to liked bikes');
    }
    setSavedFavorites(updated);
    localStorage.setItem('bike_saved_favorites', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bike_favorites_updated', { detail: updated }));

    if (user) {
      try {
        await client.post(`/favorites/toggle/${bike.id}`);
      } catch (err) {
        // Silently preserve local wishlist state
      }
    }
  };

  const getBikeCategory = (bike) => {
    const name = (bike.bike_name || '').toLowerCase();
    if (name.includes('bmw') || name.includes('himalayan') || name.includes('adv') || name.includes('xpulse')) {
      return 'ADVENTURE TOURER';
    }
    if (name.includes('mt-15') || name.includes('duke') || name.includes('pulsar') || name.includes('apache')) {
      return 'HYPER NAKED';
    }
    if (name.includes('activa') || name.includes('jupiter') || name.includes('access') || name.includes('ntorq') || name.includes('scooter')) {
      return 'SMART COMMUTER';
    }
    if (name.includes('enfield') || name.includes('classic') || name.includes('bullet') || name.includes('meteor') || name.includes('hunter')) {
      return 'MODERN CRUISER';
    }
    if (name.includes('r15') || name.includes('rs 457') || name.includes('ninja') || name.includes('rc')) {
      return 'SUPER SPORT';
    }
    return `${(bike.brand || 'PREMIUM').toUpperCase()} SERIES`;
  };

  const getBikeRating = (bikeId) => {
    const ratings = [
      { score: '4.9', count: 189 },
      { score: '4.9', count: 428 },
      { score: '4.8', count: 312 },
      { score: '4.9', count: 516 },
      { score: '4.7', count: 280 },
      { score: '4.8', count: 394 }
    ];
    return ratings[bikeId % ratings.length];
  };

  const getBikeSubtitle = (bike) => {
    const city = localStorage.getItem('bike_selected_city') || 'Pune / Hinjewadi';
    const hubName = city.includes('/') ? city.split('/')[1].trim() : city;
    const name = (bike.bike_name || '').toLowerCase();
    
    let edition = 'Special Edition';
    if (name.includes('bmw')) edition = 'Rallye Edition';
    else if (name.includes('mt-15')) edition = 'Dark Matte Metallic';
    else if (name.includes('activa')) edition = 'Smart Edition';
    else if (name.includes('hunter')) edition = 'Dapper Ash';
    else if (name.includes('himalayan')) edition = 'Kamet White';
    else if (name.includes('pulsar')) edition = 'Carbon Edition';
    else if (name.includes('apache')) edition = 'Racing Edition';
    else if (name.includes('unicorn')) edition = 'Pearl Siren Blue';
    else if (name.includes('sport')) edition = 'All Black Edition';
    else if (name.includes('rs 457')) edition = 'Prismatic Dark';
    else if (bike.edition) edition = bike.edition;
    else if (bike.brand) edition = `${bike.brand} Special`;

    return `${edition} • ${hubName}`;
  };

  const getHourlyPrice = (pricePerDay) => {
    return Math.round(pricePerDay / 12);
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('en-IN');
  };

  const formatCC = (engine) => {
    if (!engine) return '313 cc';
    let clean = String(engine).replace(/cc/i, '').trim();
    if (clean.includes('.')) {
      clean = Math.round(parseFloat(clean));
    }
    return `${clean} cc`;
  };

  const formatEfficiency = (mileage) => {
    if (!mileage) return '30 km/l';
    let clean = String(mileage).replace(/kmpl/i, '').replace(/km\/l/i, '').trim();
    if (clean.includes('-')) {
      clean = clean.split('-')[0].trim();
    }
    return `${clean} km/l`;
  };

  const formatTorque = (torque) => {
    if (!torque) return '28 Nm';
    let clean = String(torque).replace(/nm/i, '').trim();
    return `${clean} Nm`;
  };

  const getBikeStyle = (bike) => {
    if (bike.style) return bike.style;
    const name = (bike.bike_name || '').toLowerCase();
    if (name.includes('bmw') || name.includes('himalayan') || name.includes('adv') || name.includes('xpulse')) {
      return 'Panniers';
    }
    if (name.includes('activa') || name.includes('jupiter') || name.includes('access') || name.includes('ntorq') || name.includes('scooter')) {
      return 'Scooter';
    }
    if (name.includes('enfield') || name.includes('classic') || name.includes('bullet') || name.includes('meteor') || name.includes('hunter')) {
      return 'Cruiser';
    }
    if (name.includes('r15') || name.includes('rs 457') || name.includes('ninja') || name.includes('rc')) {
      return 'Sport';
    }
    return 'Street';
  };

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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
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
      const errorMessage =
        err.response?.data?.detail ||
        (err.code === 'ERR_NETWORK'
          ? 'Network error: Cannot reach the backend API. Please verify the backend deployment and connection.'
          : err.message) ||
        'Could not load bikes. Please refresh and try again.';
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [planSavings, setPlanSavings] = useState(0);

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
        let savings = 0;
        if (diffDays >= 15) {
          savings = Math.round(diffDays * selectedBike.price_per_day * 0.30);
        } else if (diffDays >= 7) {
          savings = Math.round(diffDays * selectedBike.price_per_day * 0.05);
        }
        setPlanSavings(savings);
        setTotalPrice(diffDays * selectedBike.price_per_day - savings);
      } else {
        const start = new Date(`${bookingDate}T${pickupTime}`);
        const end = new Date(`${returnDate}T${returnTime}`);
        const diffTime = end - start;
        const hours = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60))); // At least 1 hour
        setDurationHours(hours);
        setDurationDays(0);
        setPlanSavings(0);
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

    // Liked bikes only filter
    if (showOnlyLiked) {
      if (!savedFavorites.includes(bike.id)) return false;
    }

    return matchesSearch && matchesStatus && matchesPrice;
  });

  // Start Booking Flow
  // eslint-disable-next-line no-unused-vars
  const handleOpenBookingModal = (bike) => {
    // If the bike is booked, do nothing
    if (!bike.availability.toLowerCase().includes('avail')) return;

    if (!user) {
      toast.error('Please log in or sign up to book a bike.');
      navigate('/login', {
        state: {
          from: '/',
          bikeName: bike.bike_name,
          message: `Please log in or sign up to book the ${bike.bike_name}.`
        }
      });
      return;
    }

    // Check KYC status on open
    const isKycComplete = user && user.aadhaar_number && user.address && user.phone && user.profile_photo && user.pan_card && user.aadhaar_doc && user.is_verified;

    setSelectedBike(bike);
    setShowBookingModal(true);
    setBookingStep(isKycComplete ? 1 : 0);
    setBookingError(null);
    setIsProcessingPayment(false);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setReturnDate(tomorrow.toISOString().split('T')[0]);
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
    if (isSendingOtp) return;
    setIsSendingOtp(true);
    setOtpError(null);
    try {
      await sendOTP();
      setOtpSent(true);
      toast.success('Verification code sent to your email.');
    } catch (err) {
      setOtpError(err);
      toast.error(String(err));
    } finally {
      setIsSendingOtp(false);
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
              booking_date: pickupTime ? `${bookingDate} ${pickupTime}` : bookingDate,
              return_date: returnTime ? `${returnDate} ${returnTime}` : returnDate,
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

      rzp1.on('payment.failed', function (response) {
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
          <h1>Ride Beyond Limits</h1>
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
          <div className="filter-input-wrap filter-dropdown-wrap" ref={availabilityDropdownRef}>
            <button
              type="button"
              className="filter-dropdown-trigger"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              aria-expanded={isStatusDropdownOpen}
              aria-label="Filter by availability status"
            >
              <span className="filter-dropdown-value">
                {statusFilter === 'All' ? 'All Status' : statusFilter}
              </span>
              <ChevronDown 
                size={16} 
                className={`filter-dropdown-chevron ${isStatusDropdownOpen ? 'open' : ''}`} 
              />
            </button>

            {isStatusDropdownOpen && (
              <div className="filter-dropdown-menu">
                {[
                  { value: 'All', label: 'All Status' },
                  { value: 'Available', label: 'Available' },
                  { value: 'Booked', label: 'Booked' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`filter-dropdown-item ${statusFilter === opt.value ? 'active' : ''}`}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.value && <Check size={14} className="filter-item-check" />}
                  </button>
                ))}
              </div>
            )}
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

      {/* Fleet Filter Bar & Liked Bikes Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto 20px auto', padding: '0 24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 id="bikes-collection" className="section-title" style={{ margin: 0 }}>
          {showOnlyLiked ? 'Your Liked Fleet' : 'Our Premium Collection'}
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowOnlyLiked(!showOnlyLiked)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: showOnlyLiked ? '1px solid #ef4444' : '1px solid var(--border-color)',
              background: showOnlyLiked ? '#ef4444' : 'var(--bg-card)',
              color: showOnlyLiked ? '#ffffff' : 'var(--text-main)',
              boxShadow: showOnlyLiked ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={15} fill={showOnlyLiked || savedFavorites.length > 0 ? "#ef4444" : "none"} color={showOnlyLiked ? "#ffffff" : "#ef4444"} />
            <span>Liked Bikes ({savedFavorites.length})</span>
          </button>
          {showOnlyLiked && (
            <button
              type="button"
              onClick={() => setShowOnlyLiked(false)}
              style={{
                fontSize: '12px',
                color: 'var(--brand-orange)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Show All Bikes
            </button>
          )}
        </div>
      </div>

      {/* Bikes Grid */}
      <div className="bikes-grid-container">
        <div className="bikes-grid-wrapper">
          {loading ? (
            <div className="bikes-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bike-card skeleton-card">
                  <div className="skeleton-img skeleton-shimmer"></div>
                  <div className="bike-card-content">
                    <div className="skeleton-line skeleton-title skeleton-shimmer"></div>
                    <div className="skeleton-chips">
                      <div className="skeleton-chip skeleton-shimmer"></div>
                      <div className="skeleton-chip skeleton-shimmer"></div>
                      <div className="skeleton-chip skeleton-shimmer"></div>
                    </div>
                    <div className="bike-card-footer">
                      <div className="skeleton-line skeleton-price skeleton-shimmer"></div>
                      <div className="skeleton-btn skeleton-shimmer"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="bikes-empty-state bikes-error-state" style={{ borderColor: 'rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.04)' }}>
              <AlertCircle size={44} className="empty-icon" style={{ color: '#ef4444' }} />
              <h3>Failed to Load Fleet</h3>
              <p style={{ maxWidth: '480px', margin: '8px auto 16px', color: 'var(--text-muted, #64748b)' }}>{fetchError}</p>
              <button
                onClick={fetchData}
                className="btn-reset-filters"
                style={{ background: 'var(--primary, #f97316)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Retry Loading
              </button>
            </div>
          ) : filteredBikes.length === 0 ? (
            <div className="bikes-empty-state">
              <BikeIcon size={44} className="empty-icon" />
              <h3>No bikes match your filters</h3>
              <p>Try resetting the search keyword or increasing your budget range to discover available rides.</p>
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); setPriceRange(''); }}
                className="btn-reset-filters"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="bikes-grid">
              {filteredBikes.map(bike => {
                const isAvailable = bike.availability ? bike.availability.toLowerCase().includes('avail') : true;
                const ratingData = getBikeRating(bike.id);
                const isFavorited = savedFavorites.includes(bike.id);

                return (
                  <div key={bike.id} className="bike-card">
                    {/* Top Media & Floating Badges */}
                    <div 
                      className="bike-card-img-wrap" 
                      onClick={() => navigate(`/bikes/${bike.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={`status-badge ${isAvailable ? 'status-available' : 'status-booked'}`}>
                        {isAvailable ? 'Available Now' : 'Booked'}
                      </span>

                      <button
                        className={`btn-favorite-heart ${isFavorited ? 'active' : ''}`}
                        onClick={(e) => handleToggleFavorite(e, bike)}
                        title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                        type="button"
                      >
                        <Heart
                          size={15}
                          fill={isFavorited ? "#ef4444" : "none"}
                          color={isFavorited ? "#ef4444" : "var(--text-muted)"}
                        />
                      </button>

                      <BikeImage
                        src={bike.image_url}
                        alt={bike.bike_name} 
                        className="bike-card-img" 
                      />
                    </div>
                    
                    {/* Card Body */}
                    <div className="bike-card-content">
                      {/* Category & Star Rating Row */}
                      <div className="bike-card-meta-row">
                        <span className="bike-category-tag">{getBikeCategory(bike)}</span>
                        <div className="bike-rating-pill">
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          <span className="rating-score">{ratingData.score}</span>
                          <span className="rating-count">({ratingData.count})</span>
                        </div>
                      </div>

                      {/* Bike Name & Subtitle */}
                      <h3 
                        className="bike-card-title" 
                        title={bike.bike_name}
                        onClick={() => navigate(`/bikes/${bike.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {bike.bike_name}
                      </h3>
                      <div className="bike-card-subtitle">
                        {getBikeSubtitle(bike)}
                      </div>

                      {/* 4-Column Quad Specs Grid: CC, EFF, TORQUE, STYLE */}
                      <div className="bike-specs-quad-grid">
                        <div className="spec-tile">
                          <span className="spec-tile-label">CC</span>
                          <span className="spec-tile-value">{formatCC(bike.engine)}</span>
                        </div>
                        <div className="spec-tile">
                          <span className="spec-tile-label">EFF</span>
                          <span className="spec-tile-value">{formatEfficiency(bike.mileage)}</span>
                        </div>
                        <div className="spec-tile">
                          <span className="spec-tile-label">TORQUE</span>
                          <span className="spec-tile-value">{formatTorque(bike.torque)}</span>
                        </div>
                        <div className="spec-tile">
                          <span className="spec-tile-label">STYLE</span>
                          <span className="spec-tile-value">{getBikeStyle(bike)}</span>
                        </div>
                      </div>

                      {/* Price Row: Daily Left & Hourly Right */}
                      <div className="bike-card-price-row">
                        <div className="bike-daily-price">
                          <span className="price-num">₹{formatPrice(bike.price_per_day)}</span>
                          <span className="price-period">/day</span>
                        </div>
                        <div className="bike-hourly-price">
                          ₹{formatPrice(getHourlyPrice(bike.price_per_day))}/hr
                        </div>
                      </div>

                      {/* Dual Action Buttons: Details + Book Now */}
                      <div className="bike-card-actions-grid">
                        <button
                          type="button"
                          className="btn-card-details"
                          onClick={() => navigate(`/bikes/${bike.id}`)}
                        >
                          Details
                        </button>

                        {user?.role === 'admin' ? (
                          <button 
                            type="button"
                            className="btn-card-book booked"
                            disabled={true}
                            style={{ cursor: 'default', opacity: 0.85 }}
                          >
                            {isAvailable ? 'Available' : 'Booked'}
                          </button>
                        ) : (
                          <button 
                            type="button"
                            className={`btn-card-book ${!isAvailable ? 'booked' : ''}`}
                            onClick={() => navigate(`/bikes/${bike.id}`)}
                            disabled={!isAvailable}
                          >
                            {isAvailable ? 'Book Now' : 'Booked'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BIKE DETAILS MODAL */}
      {detailsBike && (
        <div className="details-modal-overlay" onClick={() => setDetailsBike(null)}>
          <div className="details-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="details-modal-close" 
              onClick={() => setDetailsBike(null)}
              aria-label="Close details"
              type="button"
            >
              <X size={15} />
            </button>

            <div className="details-modal-img-wrap">
              <BikeImage
                src={detailsBike.image_url}
                alt={detailsBike.bike_name}
                className="details-modal-img"
              />
            </div>

            <div className="details-modal-header">
              <div className="details-modal-category">{getBikeCategory(detailsBike)}</div>
              <h2 className="details-modal-title">{detailsBike.bike_name}</h2>
              <p className="details-modal-subtitle">{getBikeSubtitle(detailsBike)}</p>
            </div>

            <div className="details-modal-section-title">Specifications & Performance</div>
            <div className="bike-specs-quad-grid details-modal-specs">
              <div className="spec-tile">
                <span className="spec-tile-label">Engine CC</span>
                <span className="spec-tile-value">{formatCC(detailsBike.engine)}</span>
              </div>
              <div className="spec-tile">
                <span className="spec-tile-label">Fuel Efficiency</span>
                <span className="spec-tile-value">{formatEfficiency(detailsBike.mileage)}</span>
              </div>
              <div className="spec-tile">
                <span className="spec-tile-label">Peak Torque</span>
                <span className="spec-tile-value">{formatTorque(detailsBike.torque)}</span>
              </div>
              <div className="spec-tile">
                <span className="spec-tile-label">Body Style</span>
                <span className="spec-tile-value">{getBikeStyle(detailsBike)}</span>
              </div>
            </div>

            <div className="details-modal-section-title">Rental Perks Included</div>
            <div className="details-modal-perks">
              <div className="details-modal-perk-item">
                <Check size={13} color="#059669" />
                <span>Complimentary DOT Helmet</span>
              </div>
              <div className="details-modal-perk-item">
                <Check size={13} color="#059669" />
                <span>Unlimited Kilometers</span>
              </div>
              <div className="details-modal-perk-item">
                <Check size={13} color="#059669" />
                <span>24/7 Roadside Assistance</span>
              </div>
              <div className="details-modal-perk-item">
                <Check size={13} color="#059669" />
                <span>Standard Damage Cover</span>
              </div>
            </div>

            <div className="details-modal-footer">
              <div className="details-modal-pricing">
                <div className="details-modal-rate-big">
                  ₹{formatPrice(detailsBike.price_per_day)} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>/day</span>
                </div>
                <div className="details-modal-rate-sub">
                  ₹{formatPrice(getHourlyPrice(detailsBike.price_per_day))}/hr • Zero security deposit with verified KYC
                </div>
              </div>

              {user?.role !== 'admin' && (
                <button
                  type="button"
                  className="btn-details-book"
                  onClick={() => {
                    const bikeToBook = detailsBike;
                    setDetailsBike(null);
                    navigate(`/bikes/${bikeToBook.id}`);
                  }}
                  disabled={!detailsBike.availability || !detailsBike.availability.toLowerCase().includes('avail')}
                >
                  Book This Bike
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW REDESIGNED BOOKING MODAL */}
      {showBookingModal && selectedBike && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-wrapper">
            <button className="booking-close-btn" onClick={() => setShowBookingModal(false)} aria-label="Close modal">
              <X size={16} />
            </button>

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

              {/* STEP 0: PROFILE / KYC */}
              {bookingStep === 0 && (
                <div className="booking-step-content">
                  <h2 className="booking-main-title">Profile & KYC</h2>
                  <p className="booking-main-subtitle">Please verify your documents before renting.</p>

                  {!isKycComplete ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '8px 12px', borderRadius: '8px', color: '#fbbf24' }}>
                        <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>KYC is required for your first booking.</span>
                      </div>

                      {/* 1. Email OTP Verification */}
                      {!otpVerified ? (
                        <div style={{ background: 'var(--bg-main)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <h4 style={{ fontWeight: 800, fontSize: '13px', marginBottom: '4px', color: 'var(--text-main)' }}>1. Verify Email First</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Please verify your email ({user.email}) to proceed with KYC.</p>
                          {otpError && <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{String(otpError)}</div>}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {otpSent ? (
                              <>
                                <input type="text" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" className="cc-input" placeholder="6-digit OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ flex: 1, padding: '8px 10px', fontSize: '13px' }} />
                                <button onClick={handleVerifyOTP} className="cc-pay-btn verify-btn-effect" style={{ flex: 1, padding: '8px 14px', fontSize: '12.5px', marginTop: 0 }}>Verify</button>
                              </>
                            ) : (
                              <button onClick={handleSendOTP} disabled={isSendingOtp} className="cc-pay-btn verify-btn-effect verify-btn-pulse" style={{ padding: '8px 14px', fontSize: '12.5px', marginTop: 0 }}>
                                {isSendingOtp ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <span className="spinner" style={{ width: '12px', height: '12px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                    Sending OTP...
                                  </span>
                                ) : 'Send Verification OTP'}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: 'var(--bg-main)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={16} color="#10b981" />
                          <h4 style={{ fontWeight: 800, fontSize: '12px', color: '#10b981', margin: 0 }}>1. Email Verified</h4>
                        </div>
                      )}

                      {otpVerified && (
                        <>
                          {/* 2. Document Uploads */}
                          <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '12px', marginBottom: '8px', color: 'var(--text-main)' }}>2. Upload Documents</h4>
                            <div className="kyc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                              <label className="kyc-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                {uploadedProfileUrl ? <CheckCircle2 size={18} color="#10b981" style={{ margin: '0 auto' }} /> : <UploadCloud size={18} color="#94a3b8" style={{ margin: '0 auto' }} />}
                                <span style={{ fontSize: '10.5px', display: 'block', marginTop: '3px', fontWeight: 700 }}>Profile Photo</span>
                                <span style={{ fontSize: '9.5px', color: uploadedProfileUrl ? '#10b981' : '#ef4444' }}>{uploadedProfileUrl ? 'Uploaded' : 'Not Uploaded'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => { handleFileUpload('profile', e.target.files[0]); e.target.value = ''; }} />
                              </label>
                              <label className="kyc-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                {uploadedAadhaarUrl ? <CheckCircle2 size={18} color="#10b981" style={{ margin: '0 auto' }} /> : <UploadCloud size={18} color="#94a3b8" style={{ margin: '0 auto' }} />}
                                <span style={{ fontSize: '10.5px', display: 'block', marginTop: '3px', fontWeight: 700 }}>Aadhaar Doc</span>
                                <span style={{ fontSize: '9.5px', color: uploadedAadhaarUrl ? '#10b981' : '#ef4444' }}>{uploadedAadhaarUrl ? 'Uploaded' : 'Not Uploaded'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={(e) => { handleFileUpload('aadhaar', e.target.files[0]); e.target.value = ''; }} />
                              </label>
                              <label className="kyc-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                {uploadedPanUrl ? <CheckCircle2 size={18} color="#10b981" style={{ margin: '0 auto' }} /> : <UploadCloud size={18} color="#94a3b8" style={{ margin: '0 auto' }} />}
                                <span style={{ fontSize: '10.5px', display: 'block', marginTop: '3px', fontWeight: 700 }}>PAN Card</span>
                                <span style={{ fontSize: '9.5px', color: uploadedPanUrl ? '#10b981' : '#ef4444' }}>{uploadedPanUrl ? 'Uploaded' : 'Not Uploaded'}</span>
                                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={(e) => { handleFileUpload('pan_card', e.target.files[0]); e.target.value = ''; }} />
                              </label>
                            </div>
                          </div>

                          {/* 3. Personal Details */}
                          <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '12px', marginBottom: '8px', color: 'var(--text-main)' }}>3. Personal Details</h4>
                            <form onSubmit={handleProfileSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                  <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>PHONE</label>
                                  <input type="tel" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" title="Enter a 10-digit Indian mobile number" className="cc-input" placeholder="10-digit phone number" value={kycPhone} onChange={(e) => setKycPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required />
                                </div>
                                <div>
                                  <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>AADHAAR</label>
                                  <input type="text" inputMode="numeric" pattern="[0-9]{12}" title="Enter a 12-digit Aadhaar number" className="cc-input" placeholder="12-digit Aadhaar" value={kycAadhaar} onChange={(e) => { setKycAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12)); setAadhaarError(null); }} maxLength={12} required />
                                  {aadhaarError && <div style={{ color: '#ef4444', fontSize: '10.5px', marginTop: '3px', fontWeight: 600 }}>{aadhaarError}</div>}
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>FULL ADDRESS</label>
                                <input type="text" maxLength={300} className="cc-input" placeholder="Permanent Address" value={kycAddress} onChange={(e) => setKycAddress(e.target.value)} required />
                              </div>
                              <button type="submit" className="cc-pay-btn" style={{ padding: '8px 12px', fontSize: '12px' }}>Save Profile Details</button>
                            </form>
                          </div>
                        </>
                      )}

                      <button onClick={() => setBookingStep(1)} className="cc-pay-btn" disabled={!isKycComplete} style={{ background: isKycComplete ? '#10b981' : '#94a3b8', padding: '10px 14px', fontSize: '13px', marginTop: '4px' }}>
                        {isKycComplete ? 'Continue to Rental Info' : 'Complete KYC to Continue'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                      <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 14px auto' }} />
                      <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Your Profile is fully verified!</h3>
                      <button onClick={() => setBookingStep(1)} className="cc-pay-btn" style={{ padding: '10px 16px', fontSize: '13px' }}>Proceed to Rental Info</button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1: RENTAL INFO */}
              {bookingStep === 1 && (
                <div className="booking-step-content">
                  <h2 className="booking-main-title">Rental Info</h2>
                  <p className="booking-main-subtitle">Select dates and timings for your {selectedBike.bike_name} reservation.</p>

                  {bookingError && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>{bookingError}</div>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="cc-form-label">Pickup Date</label>
                        <input
                          type="date"
                          className="cc-input"
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="cc-form-label">Pickup Timing</label>
                        <input
                          type="time"
                          className="cc-input"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="cc-form-label">Expected Return</label>
                        <input
                          type="date"
                          className="cc-input"
                          min={bookingDate || new Date().toISOString().split('T')[0]}
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="cc-form-label">Return Timing</label>
                        <input
                          type="time"
                          className="cc-input"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pickup Hub:</span>
                      <strong style={{ color: 'var(--brand-orange)' }}>{localStorage.getItem('bike_selected_city') || 'Pimpri-Chinchwad'}</strong>
                    </div>

                    {bookingDate && returnDate && (
                      <div className="booking-rate-box">
                        <div className="booking-rate-row">
                          <span className="booking-rate-label">Rate:</span>
                          <strong className="booking-rate-val">
                            ₹{rentalType === 'hourly' ? (selectedBike.price_per_hour || Math.ceil(selectedBike.price_per_day / 24)) : selectedBike.price_per_day}/{rentalType === 'hourly' ? 'hour' : 'day'}
                          </strong>
                        </div>
                        <div className="booking-rate-row">
                          <span className="booking-rate-label">Duration:</span>
                          <strong className="booking-rate-val">
                            {rentalType === 'hourly' ? `${durationHours} Hours` : `${durationDays} Days`}
                            {pickupTime && returnTime ? (
                              <span className="booking-timing-highlight">
                                ({pickupTime} → {returnTime})
                              </span>
                            ) : ''}
                          </strong>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button onClick={() => setBookingStep(0)} className="cc-input" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', fontSize: '12.5px' }}>
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button onClick={handleInitiateCheckout} className="cc-pay-btn" style={{ flex: 2, marginTop: 0, padding: '10px 16px', fontSize: '13px' }}>Proceed to Payment</button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT (MODERN DIGITAL WALLET DESIGN) */}
              {/* STEP 2: PAYMENT (MODERN DIGITAL WALLET DESIGN) */}
              {bookingStep === 2 && (
                <div className="booking-step-content payment-step-content">
                  <h2 className="booking-main-title">Secure Checkout</h2>
                  <p className="booking-main-subtitle">Choose your preferred digital payment method.</p>

                  <div className="billing-summary-card">
                    <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.1 }}>
                      <ShieldCheck size={90} />
                    </div>
                    <div className="billing-card-header">
                      <h3 className="billing-card-title">
                        Billing Summary • {durationDays >= 15 ? '15 Days Pass' : durationDays >= 7 ? 'Weekly Pass' : (rentalType === 'hourly' ? 'Hourly Rental' : 'Daily Pass')}
                      </h3>
                      <span className="billing-card-bike-pill">{selectedBike.bike_name}</span>
                    </div>

                    <div className="billing-details-list">
                      <div className="billing-detail-row">
                        <span className="billing-label">
                          Standard Fare ({rentalType === 'hourly' ? `${durationHours} hrs` : `${durationDays} ${durationDays === 1 ? 'day' : 'days'} @ ₹${selectedBike.price_per_day?.toLocaleString('en-IN') || selectedBike.price_per_day}/day`})
                        </span>
                        <span className="billing-val">₹{(rentalType === 'hourly' ? totalPrice : (durationDays * selectedBike.price_per_day))?.toLocaleString('en-IN')}</span>
                      </div>

                      {planSavings > 0 && rentalType === 'daily' && (
                        <div className="billing-detail-row highlight-discount">
                          <span className="billing-label">Duration Discount ({durationDays >= 15 ? '30% Special OFF' : '5% Weekly OFF'})</span>
                          <span className="billing-val discount-val">-₹{planSavings?.toLocaleString('en-IN') || planSavings}</span>
                        </div>
                      )}

                      <div className="billing-detail-row">
                        <span className="billing-label">Pickup Hub</span>
                        <span className="billing-val">{localStorage.getItem('bike_selected_city') || 'Pune / Main Branch'}</span>
                      </div>

                      <div className="billing-detail-row">
                        <span className="billing-label">Rental Schedule</span>
                        <span className="billing-val">{bookingDate} ({pickupTime}) → {returnDate} ({returnTime})</span>
                      </div>

                      <div className="billing-detail-row">
                        <span className="billing-label">Complimentary Helmet</span>
                        <span className="billing-val free-val">1 ISI Helmet Included Free</span>
                      </div>

                      <div className="billing-detail-row">
                        <span className="billing-label">Damage Cover & 24/7 RSA</span>
                        <span className="billing-val free-val">Included Free (Zero Liability)</span>
                      </div>

                      <div className="billing-detail-row">
                        <span className="billing-label">Security Deposit</span>
                        <span className="billing-val free-val">₹0 (Zero Deposit Waived)</span>
                      </div>

                      <div className="billing-detail-row">
                        <span className="billing-label">Taxes & Convenience Fee</span>
                        <span className="billing-val free-val">All Taxes & GST Included</span>
                      </div>
                    </div>

                    <div className="billing-card-footer">
                      <div className="billing-total-row">
                        <div>
                          <div className="billing-total-label">Total Amount Payable</div>
                          <div className="billing-total-sub">All taxes, insurance & helmet included</div>
                        </div>
                        <span className="billing-total-val">₹{totalPrice?.toLocaleString('en-IN') || totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {paymentStatus === 'verifying' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', margin: '12px 0', color: '#ff5e14', fontWeight: 600, fontSize: '13px' }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #ff5e14', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                      Securely verifying payment details...
                    </div>
                  )}
                  {paymentStatus === 'confirmed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', margin: '12px 0', color: '#10b981', fontWeight: 600, fontSize: '13px' }}>
                      <CheckCircle2 size={18} />
                      Payment Verified & Secured!
                    </div>
                  )}

                  <div className="billing-action-buttons">
                    <button onClick={() => setBookingStep(1)} className="cc-input btn-billing-back" disabled={isProcessingPayment}>
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      className="cc-pay-btn btn-billing-pay"
                      style={{ background: paymentStatus === 'confirmed' ? '#10b981' : undefined }}
                      disabled={isProcessingPayment}
                    >
                      {paymentStatus === 'verifying' ? "Processing..." : paymentStatus === 'confirmed' ? "Confirmed" : `Pay ₹${totalPrice?.toLocaleString('en-IN') || totalPrice}`}
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
