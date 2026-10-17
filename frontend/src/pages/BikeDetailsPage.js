import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import BikeImage from '../components/BikeImage';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Heart, Star, MapPin, Check, ShieldCheck, 
  Clock, Fuel, Gauge, Zap, AlertCircle, ChevronRight,
  Shield, CheckCircle2, UploadCloud, X, Sparkles, Bike as BikeIcon
} from 'lucide-react';
import './BikeDetails.css';
import '../Home.css';
import { bookingDatesSchema, fileUploadSchema, kycSchema, otpSchema, validateWithToast } from '../validation/schemas';

// Available Hub Locations from Reference UI
const PUNE_HUBS = [
  "Janta Nagar, Yerawada",
  "Dapodi, Pimpri-Chinchwad",
  "Wakad, Near Irani Cafe",
  "Garware College, Karve Road",
  "J M Road, Shivaji Nagar",
  "Vadgaon Budruk",
  "Hinjewadi Phase 1",
  "Bhopala Chowk, Pune Cantonment",
  "Fatima Nagar, Wanwadi",
  "Pimple Gurav",
  "Kothrud Vanaz Metro Station",
  "Swargate",
  "Pimpri-Chinchwad",
  "Lakshmi Chowk, Hinjewadi Phase 1",
  "Ravet, Pimpri-Chinchwad",
  "Bhumkar Chowk, Wakad",
  "Tathawade, Hinjewadi",
  "Baner, Mahalunge Metro Station",
  "Bhugaon, Bavdhan",
  "Bhusari Colony, Kothrud",
  "Hadapsar",
  "Pune Railway Station"
];

const BikeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, uploadKYC, updateProfile, sendOTP, verifyOTP, refreshUser } = useAuth();

  const [bike, setBike] = useState(null);
  const [allBikes, setAllBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bikeError, setBikeError] = useState(null);

  // Reference UI State
  const [selectedPlan, setSelectedPlan] = useState('daily'); // 'daily', 'weekly', '15days'
  const [selectedHub, setSelectedHub] = useState(() => {
    return localStorage.getItem('bike_selected_city') || 'Hinjewadi Phase 1';
  });

  // Favorites state
  const [savedFavorites, setSavedFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bike_saved_favorites') || '[]');
    } catch {
      return [];
    }
  });

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(0);
  const [rentalType, setRentalType] = useState('daily');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('18:00');
  const [durationDays, setDurationDays] = useState(1);
  const [durationHours, setDurationHours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [planSavings, setPlanSavings] = useState(0);
  const [bookingError, setBookingError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');

  // KYC Form State
  const [kycName, setKycName] = useState(user?.name || '');
  const [kycPhone, setKycPhone] = useState(user?.phone || '');
  const [kycAadhaar, setKycAadhaar] = useState(user?.aadhaar_number || '');
  const [kycAddress, setKycAddress] = useState(user?.address || '');
  const [uploadedProfileUrl, setUploadedProfileUrl] = useState(user?.profile_photo || '');
  const [uploadedAadhaarUrl, setUploadedAadhaarUrl] = useState(user?.aadhaar_doc || '');
  const [uploadedPanUrl, setUploadedPanUrl] = useState(user?.pan_card || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(user?.is_verified || false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [aadhaarError, setAadhaarError] = useState(null);
  const [otpError, setOtpError] = useState(null);

  const isKycComplete = Boolean(
    user &&
    user.aadhaar_number &&
    user.address &&
    user.phone &&
    user.profile_photo &&
    user.pan_card &&
    user.aadhaar_doc &&
    user.is_verified
  );

  useEffect(() => {
    const fetchBikeDetails = async () => {
      setLoading(true);
      setBikeError(null);
      try {
        // Fetch current bike
        const res = await client.get(`/bikes/${id}`);
        setBike(res.data);

        // Fetch all bikes for recommendations
        const allRes = await client.get('/bikes');
        setAllBikes(Array.isArray(allRes.data) ? allRes.data : []);
      } catch (err) {
        console.error("Failed to load bike details:", err);
        const msg =
          err.response?.data?.detail ||
          (err.code === 'ERR_NETWORK'
            ? 'Network error: Cannot reach the backend API. Please verify backend deployment and connection.'
            : err.message) ||
          'Could not load bike details.';
        setBikeError(msg);
        toast.error("Could not load bike details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBikeDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (user) {
      setKycName(user.name || '');
      setKycPhone(user.phone || '');
      setKycAadhaar(user.aadhaar_number || '');
      setKycAddress(user.address || '');
      setOtpVerified(user.is_verified || false);
      setUploadedProfileUrl(user.profile_photo || '');
      setUploadedAadhaarUrl(user.aadhaar_doc || '');
      setUploadedPanUrl(user.pan_card || '');
    }
  }, [user]);

  // Helper parsers & plan calculations
  const formatPrice = (p) => Number(p || 0).toLocaleString('en-IN');

  const getWeeklyPrice = (daily) => {
    return Math.round(daily * 7 * 0.95);
  };

  const get15DaysPrice = (daily) => {
    return Math.round(daily * 15 * 0.70);
  };

  const getPlanDays = (plan) => {
    if (plan === 'weekly') return 7;
    if (plan === '15days') return 15;
    return 1;
  };

  const getPlanPrice = (plan, daily) => {
    if (plan === 'weekly') return getWeeklyPrice(daily);
    if (plan === '15days') return get15DaysPrice(daily);
    return daily;
  };

  const getPlanSavings = (plan, daily) => {
    if (plan === 'weekly') return (daily * 7) - getWeeklyPrice(daily);
    if (plan === '15days') return (daily * 15) - get15DaysPrice(daily);
    return 0;
  };

  // Calculate pricing for modal & reactive duration
  useEffect(() => {
    if (bookingDate && returnDate && bike) {
      if (rentalType === 'daily') {
        const start = new Date(bookingDate);
        const end = new Date(returnDate);
        const diffTime = end - start;
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        setDurationDays(diffDays);
        setDurationHours(0);

        const dailyRate = Number(bike.price_per_day || 0);
        let calculated = 0;
        let savings = 0;

        if (selectedPlan === '15days' && diffDays === 15) {
          calculated = Math.round(dailyRate * 15 * 0.70);
          savings = (dailyRate * 15) - calculated;
        } else if (selectedPlan === 'weekly' && diffDays === 7) {
          calculated = Math.round(dailyRate * 7 * 0.95);
          savings = (dailyRate * 7) - calculated;
        } else if (diffDays >= 15) {
          calculated = Math.round(dailyRate * diffDays * 0.70);
          savings = (dailyRate * diffDays) - calculated;
        } else if (diffDays >= 7) {
          calculated = Math.round(dailyRate * diffDays * 0.95);
          savings = (dailyRate * diffDays) - calculated;
        } else {
          calculated = dailyRate * diffDays;
          savings = 0;
        }

        setTotalPrice(calculated);
        setPlanSavings(savings);
      } else {
        const start = new Date(`${bookingDate}T${pickupTime}`);
        const end = new Date(`${returnDate}T${returnTime}`);
        const diffTime = end - start;
        const hours = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60)));
        setDurationHours(hours);
        setDurationDays(0);
        const hourlyRate = bike.price_per_hour || Math.ceil(bike.price_per_day / 24);
        setTotalPrice(hours * hourlyRate);
        setPlanSavings(0);
      }
    }
  }, [bookingDate, returnDate, pickupTime, returnTime, bike, rentalType, selectedPlan]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!bike) return;

    let updated;
    if (savedFavorites.includes(bike.id)) {
      updated = savedFavorites.filter(item => item !== bike.id);
      toast.success("Removed from wishlist");
    } else {
      updated = [...savedFavorites, bike.id];
      toast.success("Added to wishlist");
    }
    setSavedFavorites(updated);
    localStorage.setItem('bike_saved_favorites', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bike_favorites_updated', { detail: updated }));

    if (user) {
      client.post(`/favorites/toggle/${bike.id}`).catch(() => {});
    }
  };

  const handleSelectHub = (hub) => {
    setSelectedHub(hub);
    localStorage.setItem('bike_selected_city', hub);
    toast.success(`Selected Hub: ${hub}`, { id: 'hub-toast', duration: 1500 });
  };

  // User chooses a rental duration plan (Per Day, Per Week, Per 15 Days)
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setRentalType('daily');
    const startStr = bookingDate || new Date().toISOString().split('T')[0];
    const startDate = new Date(startStr);
    const days = getPlanDays(plan);

    const returnObj = new Date(startDate);
    returnObj.setDate(returnObj.getDate() + days);
    setReturnDate(returnObj.toISOString().split('T')[0]);

    if (bike) {
      const daily = Number(bike.price_per_day || 0);
      const price = getPlanPrice(plan, daily);
      const savings = getPlanSavings(plan, daily);
      const name = plan === 'weekly' ? 'Weekly Pass (7 Days)' : plan === '15days' ? '15 Days Pass' : 'Daily Pass (1 Day)';

      if (savings > 0) {
        toast.success(`Selected ${name} • ₹${formatPrice(price)} (Save ₹${formatPrice(savings)}!)`, { id: 'plan-toast', duration: 2200 });
      } else {
        toast.success(`Selected ${name} • ₹${formatPrice(price)}`, { id: 'plan-toast', duration: 2200 });
      }
    }
  };

  const handleBookingDateChange = (newDate) => {
    setBookingDate(newDate);
    if (rentalType === 'daily') {
      const days = getPlanDays(selectedPlan);
      const start = new Date(newDate);
      const end = new Date(start);
      end.setDate(end.getDate() + days);
      setReturnDate(end.toISOString().split('T')[0]);
    }
  };

  const handleReturnDateChange = (newReturnDate) => {
    setReturnDate(newReturnDate);
    if (bookingDate && newReturnDate) {
      const start = new Date(bookingDate);
      const end = new Date(newReturnDate);
      const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      if (diffDays >= 15) {
        setSelectedPlan('15days');
      } else if (diffDays >= 7) {
        setSelectedPlan('weekly');
      } else {
        setSelectedPlan('daily');
      }
    }
  };

  const handleOpenBooking = () => {
    if (!bike.availability || !bike.availability.toLowerCase().includes('avail')) {
      toast.error('This bike is currently booked.');
      return;
    }

    if (!user) {
      toast.error('Please log in or sign up to book a bike.');
      navigate('/login', {
        state: {
          from: `/bikes/${bike.id}`,
          bikeName: bike.bike_name,
          message: `Please log in to book the ${bike.bike_name}.`
        }
      });
      return;
    }

    // Precalculate initial return date based on selected plan
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setBookingDate(todayStr);

    const daysToAdd = getPlanDays(selectedPlan);
    const returnObj = new Date(today);
    returnObj.setDate(returnObj.getDate() + daysToAdd);
    setReturnDate(returnObj.toISOString().split('T')[0]);
    setRentalType('daily');

    setShowBookingModal(true);
    setBookingStep(isKycComplete ? 1 : 0);
  };

  const getBikeCategory = (b) => {
    const name = (b.bike_name || '').toLowerCase();
    if (name.includes('bmw') || name.includes('himalayan') || name.includes('adv') || name.includes('xpulse')) return 'ADVENTURE TOURER';
    if (name.includes('mt-15') || name.includes('duke') || name.includes('pulsar') || name.includes('apache')) return 'HYPER NAKED';
    if (name.includes('activa') || name.includes('jupiter') || name.includes('access') || name.includes('ntorq') || name.includes('scooter')) return 'SMART COMMUTER';
    if (name.includes('enfield') || name.includes('classic') || name.includes('bullet') || name.includes('meteor') || name.includes('hunter')) return 'MODERN CRUISER';
    if (name.includes('r15') || name.includes('rs 457') || name.includes('ninja') || name.includes('rc')) return 'SUPER SPORT';
    return `${(b.brand || 'PREMIUM').toUpperCase()} SERIES`;
  };

  const getBikeStyle = (b) => {
    if (b.style) return b.style;
    const name = (b.bike_name || '').toLowerCase();
    if (name.includes('bmw') || name.includes('himalayan') || name.includes('adv') || name.includes('xpulse')) return 'Adventure';
    if (name.includes('activa') || name.includes('jupiter') || name.includes('access') || name.includes('ntorq') || name.includes('scooter')) return 'Scooter';
    if (name.includes('enfield') || name.includes('classic') || name.includes('bullet') || name.includes('meteor') || name.includes('hunter')) return 'Cruiser';
    if (name.includes('r15') || name.includes('rs 457') || name.includes('ninja') || name.includes('rc')) return 'Sport';
    return 'Street';
  };

  // KYC and OTP Handlers
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
      const msg = err.response?.data?.detail || err.message || String(err);
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError(null);
    const validatedOtp = validateWithToast(otpSchema, otpCode);
    if (!validatedOtp) {
      toast.error('Enter the 6-digit verification code.');
      return;
    }
    try {
      await verifyOTP(validatedOtp);
      setOtpVerified(true);
      await refreshUser();
      toast.success('Email verified successfully.');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || String(err);
      setOtpError(msg);
      toast.error(msg);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setAadhaarError(null);

    const validatedKyc = validateWithToast(kycSchema, {
      name: kycName,
      phone: kycPhone,
      aadhaar: kycAadhaar,
      address: kycAddress,
    });
    if (!validatedKyc) {
      setAadhaarError(null);
      return;
    }
    setAadhaarError(null);

    try {
      await updateProfile({
        name: kycName,
        phone: kycPhone,
        aadhaar_number: kycAadhaar,
        address: kycAddress,
      });
      await refreshUser();
      toast.success('Profile details saved successfully.');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update profile';
      if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('aadhaar')) {
        setAadhaarError(errorMsg);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  // Booking Submission & Payment
  const handleInitiateCheckout = () => {
    setBookingError(null);
    const validBooking = validateWithToast(bookingDatesSchema, {
      bookingDate, returnDate, pickupTime, returnTime, rentalType,
    });
    if (!validBooking) {
      setBookingError('Check the pickup and return date and time.');
      return;
    }
    setBookingStep(2);
  };

  const handleConfirmPayment = async () => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    setPaymentStatus('verifying');

    try {
      const orderRes = await client.post('/create-order', { amount: totalPrice });
      const order = orderRes.data.order;

      const options = {
        key: "rzp_test_SpmwJjd4Zinz8T",
        amount: order.amount,
        currency: order.currency,
        name: "MotorCity Premium Rentals",
        description: `Booking for ${bike.bike_name} at ${selectedHub}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await client.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            const planName = selectedPlan === '15days' ? "15 Days Pass" : selectedPlan === 'weekly' ? "Weekly Pass" : (rentalType === 'hourly' ? "Hourly" : "Daily");
            const payload = {
              user_email: user.email,
              bike_name: bike.bike_name,
              booking_date: pickupTime ? `${bookingDate} ${pickupTime}` : bookingDate,
              return_date: returnTime ? `${returnDate} ${returnTime}` : returnDate,
              total_price: totalPrice,
              image_url: bike.image_url,
              status: "Booked",
              rental_type: planName,
              duration: rentalType === 'hourly' ? `${durationHours} Hours` : `${durationDays} Days (${planName})`,
              pickup_location: selectedHub
            };

            await client.post('/book-bike', payload);
            setPaymentStatus('success');
            setBookingStep(3);
            toast.success("Ride Confirmed! Pack your bags.", { icon: '🏍️' });

            setTimeout(() => {
              setShowBookingModal(false);
              navigate('/my-bookings');
            }, 2500);
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
        setBookingError("Payment failed: " + response.error.description);
        setIsProcessingPayment(false);
        setPaymentStatus('pending');
      });
      rzp1.open();
    } catch (err) {
      setBookingError("Failed to initiate checkout: " + (err.response?.data?.detail || err.message));
      setIsProcessingPayment(false);
      setPaymentStatus('pending');
    }
  };

  const isFavorited = bike ? savedFavorites.includes(bike.id) : false;
  const isAvailable = bike?.availability ? bike.availability.toLowerCase().includes('avail') : true;

  if (loading) {
    return (
      <div className="bike-details-container">
        <div className="bike-details-wrapper" style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="skeleton-img skeleton-shimmer" style={{ maxWidth: '800px', height: '360px', margin: '0 auto 24px auto' }}></div>
          <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: '24px', margin: '0 auto 12px auto' }}></div>
          <div className="skeleton-line skeleton-shimmer" style={{ width: '20%', height: '18px', margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  if (bikeError) {
    return (
      <div className="bike-details-container">
        <div className="bike-details-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2>Unable to Load Vehicle</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px' }}>{bikeError}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => window.location.reload()} className="btn-hero-primary">Retry</button>
            <button onClick={() => navigate('/')} className="btn-hero-secondary">Back to Fleet</button>
          </div>
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="bike-details-container">
        <div className="bike-details-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h2>Bike Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The vehicle you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate('/')} className="btn-hero-primary">Back to Fleet</button>
        </div>
      </div>
    );
  }

  const dailyPrice = bike.price_per_day;
  const weeklyPrice = getWeeklyPrice(dailyPrice);
  const fifteenDaysPrice = get15DaysPrice(dailyPrice);

  const similarBikes = allBikes
    .filter(b => b.id !== bike.id)
    .slice(0, 4);

  return (
    <div className="bike-details-container">
      <div className="bike-details-wrapper">

        {/* Top Breadcrumb Navigation */}
        <div className="bike-details-nav">
          <button onClick={() => navigate(-1)} className="btn-back-link">
            <ArrowLeft size={16} /> Back to Catalog
          </button>
          <div className="bike-breadcrumb">
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} />
            <span>Bikes</span>
            <ChevronRight size={13} />
            <span className="current">{bike.bike_name}</span>
          </div>
        </div>

        {/* ========================================================
            TOP TWO-COLUMN SECTION (Matches User's UI Screenshot)
            ======================================================== */}
        <div className="bike-hero-grid">

          {/* Left Card: Vehicle Media Showcase */}
          <div className="bike-image-card">
            <div className="bike-image-top-bar">
              <span className={`details-status-badge ${isAvailable ? 'details-status-available' : 'details-status-booked'}`}>
                {isAvailable ? 'Available Now' : 'Currently Booked'}
              </span>

              <button
                className="btn-details-fav"
                onClick={handleToggleFavorite}
                title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                type="button"
              >
                <Heart
                  size={18}
                  fill={isFavorited ? "#ef4444" : "none"}
                  color={isFavorited ? "#ef4444" : "var(--text-muted)"}
                />
              </button>
            </div>

            <div className="bike-image-display">
              <BikeImage src={bike.image_url} alt={bike.bike_name} />
            </div>

            <div className="bike-image-footer-meta">
              <span><Fuel size={14} color="var(--brand-orange)" /> {bike.fuel_tank || '12 L Tank'}</span>
              <span><Gauge size={14} color="var(--brand-orange)" /> {bike.mileage || '35 km/l'}</span>
              <span><Shield size={14} color="#059669" /> Insured Ride</span>
            </div>
          </div>

          {/* Right Card: Title, 3 Price Tiers & Location Chips (Reference Screenshot) */}
          <div className="bike-info-card">
            <div className="bike-info-header">
              <span className="bike-category-badge">{getBikeCategory(bike)}</span>
              <h1 className="bike-main-title">{bike.bike_name}</h1>
              <div className="bike-main-subrow">
                <span>{bike.brand} • Model {bike.model || '2024'}</span>
                <div className="bike-details-rating">
                  <Star size={13} fill="#b45309" color="#b45309" />
                  <span>4.8 (312 reviews)</span>
                </div>
              </div>
            </div>

            {/* 3 Price Tiers (Matching UI Screenshot) */}
            <div className="price-tiers-row">
              <div
                className={`price-tier-box ${selectedPlan === 'daily' ? 'active' : ''}`}
                onClick={() => handleSelectPlan('daily')}
              >
                <div className="tier-badge-wrap">
                  <span className="tier-badge standard">Standard</span>
                </div>
                <div className="tier-price">₹{formatPrice(dailyPrice)}</div>
                <div className="tier-label">Per Day</div>
              </div>

              <div
                className={`price-tier-box ${selectedPlan === 'weekly' ? 'active' : ''}`}
                onClick={() => handleSelectPlan('weekly')}
              >
                <div className="tier-badge-wrap">
                  <span className="tier-badge save">5% OFF</span>
                </div>
                <div className="tier-price">₹{formatPrice(weeklyPrice)}</div>
                <div className="tier-label">Per Week</div>
              </div>

              <div
                className={`price-tier-box ${selectedPlan === '15days' ? 'active' : ''}`}
                onClick={() => handleSelectPlan('15days')}
              >
                <div className="tier-badge-wrap">
                  <span className="tier-badge best">30% OFF</span>
                </div>
                <div className="tier-price">₹{formatPrice(fifteenDaysPrice)}</div>
                <div className="tier-label">Per 15 Days</div>
              </div>
            </div>

            {/* Plan Value Highlight Strip */}
            <div className="plan-summary-strip">
              <span className="plan-summary-tag">
                {selectedPlan === '15days' ? '15 Days Pass' : selectedPlan === 'weekly' ? 'Weekly Pass' : 'Daily Pass'}
              </span>
              <span className="plan-summary-text">
                {selectedPlan === '15days'
                  ? `₹${formatPrice(Math.round(fifteenDaysPrice / 15))}/day • You save ₹${formatPrice((15 * dailyPrice) - fifteenDaysPrice)} (30% discount)`
                  : selectedPlan === 'weekly'
                  ? `₹${formatPrice(Math.round(weeklyPrice / 7))}/day • You save ₹${formatPrice((7 * dailyPrice) - weeklyPrice)} (5% discount)`
                  : `₹${formatPrice(dailyPrice)}/day • Full flexibility with zero long-term commitment`}
              </span>
            </div>

            {/* Bike Available At Section (Interactive Location Selector from Screenshot) */}
            <div className="locations-section">
              <div className="locations-title">Bike available at:</div>
              <div className="locations-chips-grid">
                {PUNE_HUBS.map((hub, index) => {
                  const isSelected = selectedHub === hub;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`location-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectHub(hub)}
                    >
                      {hub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA & Active Selection Footer */}
            <div className="details-cta-bar">
              <div className="selected-hub-info">
                <span className="selected-hub-label">Selected Pickup Hub</span>
                <span className="selected-hub-name">
                  <MapPin size={16} color="var(--brand-orange)" /> {selectedHub}
                </span>
              </div>

              <div className="selected-plan-cta-info">
                <span className="selected-plan-cta-label">Rental Total</span>
                <div className="selected-plan-cta-val">
                  ₹{formatPrice(selectedPlan === '15days' ? fifteenDaysPrice : selectedPlan === 'weekly' ? weeklyPrice : dailyPrice)}
                  {selectedPlan !== 'daily' && (
                    <span className="selected-plan-savings-pill">
                      {selectedPlan === '15days' ? 'Save 30%' : 'Save 5%'}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn-main-book"
                onClick={handleOpenBooking}
                disabled={!isAvailable}
              >
                {isAvailable
                  ? (selectedPlan === '15days'
                      ? `Book 15 Days • ₹${formatPrice(fifteenDaysPrice)}`
                      : selectedPlan === 'weekly'
                      ? `Book 7 Days • ₹${formatPrice(weeklyPrice)}`
                      : `Book For 1 Day • ₹${formatPrice(dailyPrice)}`)
                  : 'Currently Unavailable'}
              </button>
            </div>

          </div>

        </div>

        {/* ========================================================
            SPECIFICATIONS & PERFORMANCE (Keeping Existing Rich Details)
            ======================================================== */}
        <div className="details-section-card">
          <h2 className="details-card-heading">
            <Zap size={20} color="var(--brand-orange)" /> Specifications & Performance
          </h2>
          <div className="details-full-specs-grid">
            <div className="details-spec-tile">
              <div className="spec-icon-wrap"><Gauge size={18} /></div>
              <span className="spec-label">Engine CC</span>
              <span className="spec-value">{bike.engine || '349 cc'}</span>
            </div>

            <div className="details-spec-tile">
              <div className="spec-icon-wrap"><Fuel size={18} /></div>
              <span className="spec-label">Fuel Efficiency</span>
              <span className="spec-value">{bike.mileage || '35 km/l'}</span>
            </div>

            <div className="details-spec-tile">
              <div className="spec-icon-wrap"><Zap size={18} /></div>
              <span className="spec-label">Peak Torque</span>
              <span className="spec-value">{bike.torque || '27 Nm'}</span>
            </div>

            <div className="details-spec-tile">
              <div className="spec-icon-wrap"><Shield size={18} /></div>
              <span className="spec-label">Body Style</span>
              <span className="spec-value">{getBikeStyle(bike)}</span>
            </div>

            <div className="details-spec-tile">
              <div className="spec-icon-wrap"><Fuel size={18} /></div>
              <span className="spec-label">Fuel Tank Capacity</span>
              <span className="spec-value">{bike.fuel_tank || '13 L'}</span>
            </div>

            <div className="details-spec-tile">
              <div className="spec-icon-wrap"><Clock size={18} /></div>
              <span className="spec-label">Hourly Rate</span>
              <span className="spec-value">₹{formatPrice(bike.price_per_hour || Math.round(bike.price_per_day / 12))}/hr</span>
            </div>

            <div className="details-spec-tile">
              <div className="spec-icon-wrap"><Check size={18} /></div>
              <span className="spec-label">Registration Plate</span>
              <span className="spec-value">{bike.plate_number || 'MH12 AB 1234'}</span>
            </div>

            <div className="details-spec-tile">
              <div className="spec-icon-wrap"><ShieldCheck size={18} /></div>
              <span className="spec-label">Transmission / Year</span>
              <span className="spec-value">Standard • {bike.model || '2024'}</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            RENTAL PERKS INCLUDED (Keeping Existing Details)
            ======================================================== */}
        <div className="details-section-card">
          <h2 className="details-card-heading">
            <ShieldCheck size={20} color="#10b981" /> Rental Perks Included With Every Ride
          </h2>
          <div className="details-perks-grid">
            <div className="details-perk-card">
              <div className="details-perk-icon-title">
                <Check size={16} /> Complimentary DOT Helmet
              </div>
              <p className="details-perk-desc">Sanitized, ISI & DOT-certified protective helmet included for the primary rider.</p>
            </div>

            <div className="details-perk-card">
              <div className="details-perk-icon-title">
                <Check size={16} /> Unlimited Kilometers
              </div>
              <p className="details-perk-desc">Ride without distance anxiety. Enjoy zero per-kilometer excess charges.</p>
            </div>

            <div className="details-perk-card">
              <div className="details-perk-icon-title">
                <Check size={16} /> 24/7 Roadside Assistance
              </div>
              <p className="details-perk-desc">Instant roadside rescue, flat-tire assistance, and towing across all city routes.</p>
            </div>

            <div className="details-perk-card">
              <div className="details-perk-icon-title">
                <Check size={16} /> Standard Damage Cover
              </div>
              <p className="details-perk-desc">Comprehensive basic insurance against unintended accidental third-party liability.</p>
            </div>
          </div>
        </div>

        {/* ========================================================
            RENTAL POLICIES & TERMS
            ======================================================== */}
        <div className="details-section-card">
          <h2 className="details-card-heading">
            <AlertCircle size={20} color="var(--brand-orange)" /> Important Rental Terms & Requirements
          </h2>
          <div className="terms-points-grid">
            <div className="term-point-item">
              <Check size={16} />
              <span><strong>Valid Driver's License:</strong> Original physical or DigiLocker Driving License mandatory at vehicle handover.</span>
            </div>
            <div className="term-point-item">
              <Check size={16} />
              <span><strong>Zero Security Deposit:</strong> Verified KYC accounts qualify for 100% zero security deposit.</span>
            </div>
            <div className="term-point-item">
              <Check size={16} />
              <span><strong>Like-to-Like Fuel:</strong> Receive with sufficient fuel, return with the same level to avoid refuel surcharges.</span>
            </div>
            <div className="term-point-item">
              <Check size={16} />
              <span><strong>Helmets Mandatory:</strong> Strictly wear the provided helmet at all times in compliance with traffic law.</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            SIMILAR RECOMMENDED RIDES
            ======================================================== */}
        {similarBikes.length > 0 && (
          <div className="details-section-card" style={{ marginBottom: 0 }}>
            <h2 className="details-card-heading">
              <Sparkles size={20} color="var(--brand-orange)" /> Similar Rides You May Like
            </h2>
            <div className="similar-bikes-grid">
              {similarBikes.map(sim => (
                <div
                  key={sim.id}
                  className="bike-card"
                  onClick={() => navigate(`/bikes/${sim.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="bike-card-img-wrap">
                    <BikeImage src={sim.image_url} alt={sim.bike_name} className="bike-card-img" />
                  </div>
                  <div className="bike-card-content">
                    <div className="bike-card-meta-row">
                      <span className="bike-category-tag">{getBikeCategory(sim)}</span>
                      <div className="bike-rating-pill">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span className="rating-score">4.8</span>
                      </div>
                    </div>
                    <h3 className="bike-card-title">{sim.bike_name}</h3>
                    <div className="bike-card-subtitle">{sim.brand} • {sim.model || '2024'}</div>
                    <div className="bike-card-price-row">
                      <div className="bike-daily-price">
                        <span className="price-num">₹{formatPrice(sim.price_per_day)}</span>
                        <span className="price-period">/day</span>
                      </div>
                      <span className="bike-hourly-price">₹{formatPrice(Math.round(sim.price_per_day / 12))}/hr</span>
                    </div>
                    <div className="bike-card-actions-grid">
                      <button className="btn-card-details" onClick={(e) => { e.stopPropagation(); navigate(`/bikes/${sim.id}`); }}>
                        View Details
                      </button>
                      <button className="btn-card-book" onClick={(e) => { e.stopPropagation(); navigate(`/bikes/${sim.id}`); }}>
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          INTEGRATED BOOKING MODAL (Step-by-step Flow)
          ======================================================== */}
      {showBookingModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-wrapper">
            <button className="booking-close-btn" onClick={() => setShowBookingModal(false)} aria-label="Close modal">
              <X size={16} />
            </button>

            {/* LEFT SIDEBAR */}
            <div className="booking-sidebar">
              <div className="booking-sidebar-header">
                <BikeIcon size={20} color="#ff5e14" />
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
                <div className="booking-sidebar-total">₹{totalPrice > 0 ? totalPrice : (rentalType === 'hourly' ? (bike.price_per_hour || Math.ceil(bike.price_per_day / 24)) : bike.price_per_day)}</div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                  Pickup: {selectedHub}
                </div>
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
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Please verify your email ({user?.email}) to proceed with KYC.</p>
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
                  <p className="booking-main-subtitle">Select dates and timings for your {bike.bike_name} reservation.</p>

                  {bookingError && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>{bookingError}</div>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Quick Duration Plan Selector inside modal */}
                    <div>
                      <label className="cc-form-label" style={{ marginBottom: '6px', display: 'block' }}>Select Duration Plan</label>
                      <div className="modal-plan-selector">
                        <button
                          type="button"
                          className={`modal-plan-chip ${selectedPlan === 'daily' && rentalType === 'daily' ? 'active' : ''}`}
                          onClick={() => handleSelectPlan('daily')}
                        >
                          <span>1 Day</span>
                          <strong>₹{formatPrice(dailyPrice)}</strong>
                        </button>

                        <button
                          type="button"
                          className={`modal-plan-chip ${selectedPlan === 'weekly' && rentalType === 'daily' ? 'active' : ''}`}
                          onClick={() => handleSelectPlan('weekly')}
                        >
                          <span className="chip-badge">5% OFF</span>
                          <span>7 Days</span>
                          <strong>₹{formatPrice(weeklyPrice)}</strong>
                        </button>

                        <button
                          type="button"
                          className={`modal-plan-chip ${selectedPlan === '15days' && rentalType === 'daily' ? 'active' : ''}`}
                          onClick={() => handleSelectPlan('15days')}
                        >
                          <span className="chip-badge best">30% OFF</span>
                          <span>15 Days</span>
                          <strong>₹{formatPrice(fifteenDaysPrice)}</strong>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="cc-form-label">Pickup Date</label>
                        <input
                          type="date"
                          className="cc-input"
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingDate}
                          onChange={(e) => handleBookingDateChange(e.target.value)}
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
                          onChange={(e) => handleReturnDateChange(e.target.value)}
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
                      <strong style={{ color: 'var(--brand-orange)' }}>{selectedHub}</strong>
                    </div>

                    {bookingDate && returnDate && (
                      <div className="booking-rate-box">
                        <div className="booking-rate-row">
                          <span className="booking-rate-label">Active Plan:</span>
                          <strong className="booking-rate-val">
                            {rentalType === 'hourly'
                              ? 'Hourly Rental'
                              : selectedPlan === '15days'
                              ? '15 Days Pass (30% Discount)'
                              : selectedPlan === 'weekly'
                              ? 'Weekly Pass (5% Discount)'
                              : 'Daily Pass'}
                          </strong>
                        </div>

                        <div className="booking-rate-row">
                          <span className="booking-rate-label">Effective Rate:</span>
                          <strong className="booking-rate-val">
                            {rentalType === 'hourly'
                              ? `₹${formatPrice(bike.price_per_hour || Math.ceil(bike.price_per_day / 24))}/hour`
                              : selectedPlan === '15days'
                              ? `₹${formatPrice(Math.round(fifteenDaysPrice / 15))}/day`
                              : selectedPlan === 'weekly'
                              ? `₹${formatPrice(Math.round(weeklyPrice / 7))}/day`
                              : `₹${formatPrice(dailyPrice)}/day`}
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

                        {planSavings > 0 && rentalType === 'daily' && (
                          <div className="booking-savings-highlight">
                            🎉 You save ₹{formatPrice(planSavings)} on this booking!
                          </div>
                        )}
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
                        Billing Summary • {selectedPlan === '15days' ? '15 Days Pass' : selectedPlan === 'weekly' ? 'Weekly Pass' : (rentalType === 'hourly' ? 'Hourly Rental' : 'Daily Pass')}
                      </h3>
                      <span className="billing-card-bike-pill">{bike.bike_name}</span>
                    </div>

                    <div className="billing-details-list">
                      <div className="billing-detail-row">
                        <span className="billing-label">
                          Standard Fare ({rentalType === 'hourly' ? `${durationHours} hrs` : `${durationDays} days @ ₹${formatPrice(dailyPrice)}/day`})
                        </span>
                        <span className="billing-val">₹{formatPrice(rentalType === 'hourly' ? totalPrice : (durationDays * dailyPrice))}</span>
                      </div>

                      {planSavings > 0 && rentalType === 'daily' && (
                        <div className="billing-detail-row highlight-discount">
                          <span className="billing-label">Duration Discount ({selectedPlan === '15days' ? '30% OFF' : '5% OFF'})</span>
                          <span className="billing-val discount-val">-₹{formatPrice(planSavings)}</span>
                        </div>
                      )}

                      <div className="billing-detail-row">
                        <span className="billing-label">Pickup Hub</span>
                        <span className="billing-val">{selectedHub}</span>
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
                          <div className="billing-total-sub">All taxes & coverage included</div>
                        </div>
                        <span className="billing-total-val">₹{formatPrice(totalPrice)}</span>
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
                      {paymentStatus === 'verifying' ? "Processing..." : paymentStatus === 'confirmed' ? "Confirmed" : `Pay ₹${formatPrice(totalPrice)}`}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRMATION */}
              {bookingStep === 3 && (
                <div className="booking-step-content" style={{ textAlign: 'center', paddingTop: '40px' }}>
                  <CheckCircle2 size={80} color="#10b981" style={{ margin: '0 auto 20px auto' }} />
                  <h2 className="booking-main-title" style={{ color: '#10b981' }}>Booking Confirmed!</h2>
                  <p className="booking-main-subtitle">Your reservation for {bike.bike_name} is confirmed. Redirecting to your bookings pass...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BikeDetailsPage;
