import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Star, 
  Bike as BikeIcon, 
  ArrowLeft, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import BikeImage from '../components/BikeImage';
import '../Home.css';
import './LikedBikes.css';

const LikedBikesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bikes, setBikes] = useState([]);
  const [savedFavorites, setSavedFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bike_saved_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  // Booking Modal State (Instant In-Page Booking for Liked Bikes)
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [rentalType, setRentalType] = useState('daily');
  const [bookingDate, setBookingDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('18:00');
  const [durationDays, setDurationDays] = useState(1);
  const [durationHours, setDurationHours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [planSavings, setPlanSavings] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [bookingError, setBookingError] = useState(null);

  // Sync favorites across windows / tabs and backend
  useEffect(() => {
    const handleFavoritesUpdated = (e) => {
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

    window.addEventListener('bike_favorites_updated', handleFavoritesUpdated);
    window.addEventListener('storage', handleFavoritesUpdated);

    return () => {
      window.removeEventListener('bike_favorites_updated', handleFavoritesUpdated);
      window.removeEventListener('storage', handleFavoritesUpdated);
    };
  }, []);

  // Fetch all bikes and sync with backend favorites
  useEffect(() => {
    const fetchBikesAndFavorites = async () => {
      setLoading(true);
      try {
        const bikesRes = await client.get('/bikes');
        if (Array.isArray(bikesRes.data)) {
          setBikes(bikesRes.data);
        }

        // If authenticated, also fetch backend favorites
        if (user) {
          try {
            const favRes = await client.get('/favorites');
            if (Array.isArray(favRes.data)) {
              const backendIds = favRes.data.map(b => b.id);
              const localIds = JSON.parse(localStorage.getItem('bike_saved_favorites') || '[]');
              const merged = Array.from(new Set([...localIds, ...backendIds]));
              setSavedFavorites(merged);
              localStorage.setItem('bike_saved_favorites', JSON.stringify(merged));
            }
          } catch {
            // Silently retain local state
          }
        }
      } catch (err) {
        toast.error('Unable to load bikes fleet');
      } finally {
        setLoading(false);
      }
    };

    fetchBikesAndFavorites();
  }, [user]);

  // Handle toggling favorite (unlike bike)
  const handleToggleFavorite = async (e, bike) => {
    e.stopPropagation();
    let updated;
    if (savedFavorites.includes(bike.id)) {
      updated = savedFavorites.filter(id => id !== bike.id);
      toast.success(`Removed ${bike.bike_name} from Liked Bikes`);
    } else {
      updated = [...savedFavorites, bike.id];
      toast.success(`Added ${bike.bike_name} to Liked Bikes`);
    }

    setSavedFavorites(updated);
    localStorage.setItem('bike_saved_favorites', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bike_favorites_updated', { detail: updated }));

    if (user) {
      try {
        await client.post(`/favorites/toggle/${bike.id}`);
      } catch {
        // Silently preserve local favorites
      }
    }
  };

  // Helper formatting functions matching home page
  const formatCC = (engine) => {
    if (!engine) return '313 cc';
    let clean = String(engine).replace(/cc/i, '').trim();
    if (clean.includes('.')) clean = Math.round(parseFloat(clean));
    return `${clean} cc`;
  };

  const formatEfficiency = (mileage) => {
    if (!mileage) return '30 km/l';
    let clean = String(mileage).replace(/kmpl/i, '').replace(/km\/l/i, '').trim();
    if (clean.includes('-')) clean = clean.split('-')[0].trim();
    return `${clean} km/l`;
  };

  const formatTorque = (torque) => {
    if (!torque) return '28 Nm';
    let clean = String(torque).replace(/nm/i, '').trim();
    return `${clean} Nm`;
  };

  const getBikeCategory = (bike) => {
    const name = (bike.bike_name || '').toLowerCase();
    if (name.includes('bmw') || name.includes('himalayan') || name.includes('adv') || name.includes('xpulse')) return 'ADVENTURE TOURER';
    if (name.includes('mt-15') || name.includes('duke') || name.includes('pulsar') || name.includes('apache')) return 'HYPER NAKED';
    if (name.includes('activa') || name.includes('jupiter') || name.includes('access') || name.includes('ntorq') || name.includes('scooter')) return 'SMART COMMUTER';
    if (name.includes('enfield') || name.includes('classic') || name.includes('bullet') || name.includes('meteor') || name.includes('hunter')) return 'MODERN CRUISER';
    if (name.includes('r15') || name.includes('rs 457') || name.includes('ninja') || name.includes('rc')) return 'SUPER SPORT';
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

  // Filter bikes: ONLY bikes present in savedFavorites
  const likedBikes = bikes.filter(bike => savedFavorites.includes(bike.id));

  // Calculate rental pricing dynamically for modal
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
        const hours = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60)));
        setDurationHours(hours);
        setDurationDays(0);
        setPlanSavings(0);
        const hourlyRate = selectedBike.price_per_hour || Math.ceil(selectedBike.price_per_day / 24);
        setTotalPrice(hours * hourlyRate);
      }
    }
  }, [bookingDate, returnDate, pickupTime, returnTime, selectedBike, rentalType]);

  // Open booking modal directly from a liked card
  const handleOpenBooking = (bike) => {
    if (!user) {
      toast('Please sign in to proceed with booking', { icon: '🔒' });
      navigate('/login');
      return;
    }
    setSelectedBike(bike);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setBookingDate(todayStr);
    setReturnDate(tomorrowStr);
    setPickupTime('09:00');
    setReturnTime('18:00');
    setBookingStep(1);
    setPaymentStatus('pending');
    setBookingError(null);
    setShowBookingModal(true);
  };

  // Payment Confirmation
  const handleConfirmPayment = async () => {
    if (!bookingDate || !returnDate) {
      toast.error('Please specify valid dates');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus('verifying');
    setBookingError(null);

    const bookingPayload = {
      bike_id: selectedBike.id,
      start_date: bookingDate,
      end_date: returnDate,
      pickup_time: pickupTime,
      dropoff_time: returnTime,
      total_price: totalPrice,
      rental_type: rentalType,
      city: localStorage.getItem('bike_selected_city') || 'Pune / Hinjewadi',
      duration_hours: rentalType === 'hourly' ? durationHours : 0
    };

    setTimeout(async () => {
      try {
        await client.post('/bookings', bookingPayload);
        setPaymentStatus('confirmed');
        toast.success(`Booking Confirmed for ${selectedBike.bike_name}!`, { duration: 4000 });
        setBookingStep(3);

        setTimeout(() => {
          setShowBookingModal(false);
          navigate('/my-bookings');
        }, 1500);
      } catch (err) {
        setPaymentStatus('pending');
        const msg = err.response?.data?.detail || 'Booking failed. Please try again.';
        setBookingError(msg);
        toast.error(msg);
      } finally {
        setIsProcessingPayment(false);
      }
    }, 1800);
  };

  return (
    <div className="liked-bikes-page-container">
      {/* Hero Header */}
      <div className="liked-bikes-hero">
        <div className="liked-bikes-hero-inner">
          <div className="liked-bikes-hero-content">
            <div className="liked-bikes-badge">
              <Heart size={14} fill="#f87171" color="#f87171" />
              <span>Rider's Liked Fleet</span>
            </div>
            <h1 className="liked-bikes-title">Liked Bikes</h1>
            <p className="liked-bikes-subtitle">
              Your curated collection of favorite machines saved to your Rider Account. Instant reservation ready.
            </p>
          </div>

          <div className="liked-bikes-hero-actions">
            <Link to="/" className="btn-hero-explore">
              <ArrowLeft size={16} />
              <span>Browse All Bikes</span>
            </Link>
            <div className="liked-bikes-count-pill">
              <Sparkles size={15} />
              <span>{likedBikes.length} {likedBikes.length === 1 ? 'Bike Saved' : 'Bikes Saved'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="liked-bikes-content-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--brand-orange)' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255, 94, 20, 0.2)', borderTopColor: '#ff5e14', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
            <p style={{ fontWeight: 600 }}>Loading your liked rides...</p>
          </div>
        ) : likedBikes.length === 0 ? (
          /* Empty State: No Liked Bikes */
          <div className="liked-bikes-empty-card">
            <div className="liked-empty-icon-wrap">
              <Heart size={36} fill="#ef4444" color="#ef4444" />
            </div>
            <h3 className="liked-empty-title">Your Liked List is Empty</h3>
            <p className="liked-empty-desc">
              You haven't added any bikes to your favorites yet. Explore our premium fleet and tap the heart icon on any bike to save your dream rides to your Rider Account!
            </p>
            <Link to="/" className="btn-empty-browse">
              <BikeIcon size={18} />
              <span>Explore Fleet & Like Bikes</span>
            </Link>
          </div>
        ) : (
          /* Liked Bikes List Display */
          <div className="bikes-grid">
            {likedBikes.map(bike => {
              const isAvailable = bike.availability ? bike.availability.toLowerCase().includes('avail') : true;
              const ratingData = getBikeRating(bike.id);

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

                        {/* Unlike / Like Button */}
                        <button
                          className="btn-favorite-heart active"
                          onClick={(e) => handleToggleFavorite(e, bike)}
                          title="Remove from Liked Bikes"
                          type="button"
                        >
                          <Heart size={16} fill="#ef4444" color="#ef4444" />
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
                          <button 
                            type="button"
                            className={`btn-card-book ${!isAvailable ? 'booked' : ''}`}
                            onClick={() => handleOpenBooking(bike)}
                            disabled={!isAvailable}
                          >
                            {isAvailable ? 'Book Now' : 'Booked'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
      </div>

      {/* INSTANT BOOKING MODAL FOR LIKED BIKES */}
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
                <div className={`booking-step-item ${bookingStep === 1 ? 'active' : (bookingStep > 1 ? 'completed' : '')}`}>Rental Info</div>
                <div className={`booking-step-item ${bookingStep === 2 ? 'active' : (bookingStep > 2 ? 'completed' : '')}`}>Payment</div>
                <div className={`booking-step-item ${bookingStep === 3 ? 'active success' : ''}`}>Confirmation</div>
              </div>

              <div className="booking-sidebar-footer">
                <div className="booking-sidebar-footer-title">Total Amount</div>
                <div className="booking-sidebar-total">₹{totalPrice > 0 ? totalPrice?.toLocaleString('en-IN') : selectedBike.price_per_day?.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* RIGHT MAIN CONTENT */}
            <div className="booking-main-content">
              {/* STEP 1: RENTAL DATES & SCHEDULE */}
              {bookingStep === 1 && (
                <div className="booking-step-content">
                  <h2 className="booking-main-title">Rental Schedule</h2>
                  <p className="booking-main-subtitle">Choose your pickup and dropoff window for {selectedBike.bike_name}.</p>

                  <div className="cc-form-grid" style={{ gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="cc-form-label">Pickup Date</label>
                        <input
                          type="date"
                          className="cc-input"
                          value={bookingDate}
                          min={new Date().toISOString().split('T')[0]}
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
                        <label className="cc-form-label">Return Date</label>
                        <input
                          type="date"
                          className="cc-input"
                          value={returnDate}
                          min={bookingDate || new Date().toISOString().split('T')[0]}
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
                      <strong style={{ color: 'var(--brand-orange)' }}>{localStorage.getItem('bike_selected_city') || 'Pune / Hinjewadi'}</strong>
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
                          </strong>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button onClick={() => setShowBookingModal(false)} className="cc-input" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '10px 14px', fontSize: '13px' }}>
                        Cancel
                      </button>
                      <button onClick={() => setBookingStep(2)} className="cc-pay-btn" style={{ flex: 2, marginTop: 0, padding: '10px 16px', fontSize: '13px' }}>
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: EXPANDED SECURE CHECKOUT */}
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
                        <span className="billing-val">{localStorage.getItem('bike_selected_city') || 'Pune / Hinjewadi'}</span>
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

                  {bookingError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', margin: '8px 0', color: '#ef4444', fontSize: '12.5px', fontWeight: 600 }}>
                      <AlertCircle size={15} />
                      <span>{bookingError}</span>
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
                  <p className="booking-main-subtitle">Your reservation for {selectedBike.bike_name} is confirmed. Redirecting to your bookings pass...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikedBikesPage;
