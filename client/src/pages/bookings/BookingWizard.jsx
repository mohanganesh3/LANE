import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './BookingWizard.css';

const BookingWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRide = location.state?.ride;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const [bookingData, setBookingData] = useState({
    rideId: selectedRide?.id || '',
    seats: 1,
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    emergencyContact: '',
    emergencyName: '',
    pickupPoint: '',
    dropoffPoint: '',
    specialRequests: '',
    paymentMethod: 'wallet',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    upiId: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!selectedRide) {
      alert('Please select a ride first');
      navigate('/search');
    }
  }, [selectedRide, navigate]);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (bookingData.seats < 1) newErrors.seats = 'At least 1 seat required';
    }

    if (step === 2) {
      if (!bookingData.passengerName.trim()) newErrors.passengerName = 'Name is required';
      if (!bookingData.passengerPhone.trim()) newErrors.passengerPhone = 'Phone is required';
      if (bookingData.passengerPhone.length !== 10) newErrors.passengerPhone = 'Invalid phone number';
      if (!bookingData.passengerEmail.trim()) newErrors.passengerEmail = 'Email is required';
      if (!bookingData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact required';
      if (!bookingData.emergencyName.trim()) newErrors.emergencyName = 'Emergency contact name required';
    }

    if (step === 3) {
      if (bookingData.paymentMethod === 'card') {
        if (!bookingData.cardNumber) newErrors.cardNumber = 'Card number required';
        if (!bookingData.cardExpiry) newErrors.cardExpiry = 'Expiry required';
        if (!bookingData.cardCVV) newErrors.cardCVV = 'CVV required';
      } else if (bookingData.paymentMethod === 'upi') {
        if (!bookingData.upiId) newErrors.upiId = 'UPI ID required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/bookings/create', {
        ...bookingData,
        totalAmount: selectedRide.pricePerSeat * bookingData.seats
      });

      if (response.data.success) {
        setBookingId(response.data.bookingId);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    window.print();
  };

  if (!selectedRide) return null;

  const totalAmount = selectedRide.pricePerSeat * bookingData.seats;
  const platformFee = Math.round(totalAmount * 0.05);
  const gst = Math.round((totalAmount + platformFee) * 0.18);
  const finalAmount = totalAmount + platformFee + gst;

  return (
    <div className="booking-wizard">
      <div className="wizard-container">
        {/* Progress Steps */}
        <div className="wizard-steps">
          {[
            { num: 1, label: 'Confirm Ride' },
            { num: 2, label: 'Passenger Details' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Confirmation' }
          ].map((step) => (
            <div 
              key={step.num} 
              className={`step ${currentStep >= step.num ? 'active' : ''} ${currentStep === step.num ? 'current' : ''}`}
            >
              <div className="step-circle">{step.num}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="wizard-content">
          {/* Step 1: Ride Confirmation */}
          {currentStep === 1 && (
            <div className="step-panel">
              <h2>Confirm Your Ride</h2>
              
              <div className="ride-summary">
                <div className="ride-route">
                  <div className="route-point">
                    <span className="route-icon pickup">📍</span>
                    <div>
                      <div className="route-label">Pickup</div>
                      <div className="route-location">{selectedRide.from}</div>
                    </div>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point">
                    <span className="route-icon dropoff">📍</span>
                    <div>
                      <div className="route-label">Drop-off</div>
                      <div className="route-location">{selectedRide.to}</div>
                    </div>
                  </div>
                </div>

                <div className="ride-details-grid">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div>
                      <div className="detail-label">Date</div>
                      <div className="detail-value">{selectedRide.date}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🕐</span>
                    <div>
                      <div className="detail-label">Time</div>
                      <div className="detail-value">{selectedRide.time}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🚗</span>
                    <div>
                      <div className="detail-label">Vehicle</div>
                      <div className="detail-value">{selectedRide.vehicleType}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⭐</span>
                    <div>
                      <div className="detail-label">Rating</div>
                      <div className="detail-value">{selectedRide.rating || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="seats-selector">
                  <label htmlFor="seats">Number of Seats</label>
                  <select
                    id="seats"
                    name="seats"
                    value={bookingData.seats}
                    onChange={handleChange}
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Seat' : 'Seats'}</option>
                    ))}
                  </select>
                </div>

                <div className="price-summary">
                  <div className="price-row">
                    <span>Price per seat</span>
                    <span>₹{selectedRide.pricePerSeat}</span>
                  </div>
                  <div className="price-row">
                    <span>Seats × {bookingData.seats}</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Passenger Details */}
          {currentStep === 2 && (
            <div className="step-panel">
              <h2>Passenger Details</h2>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="passengerName">Full Name *</label>
                  <input
                    type="text"
                    id="passengerName"
                    name="passengerName"
                    value={bookingData.passengerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.passengerName ? 'error' : ''}
                  />
                  {errors.passengerName && <span className="error-message">{errors.passengerName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="passengerPhone">Phone Number *</label>
                  <input
                    type="tel"
                    id="passengerPhone"
                    name="passengerPhone"
                    value={bookingData.passengerPhone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    className={errors.passengerPhone ? 'error' : ''}
                  />
                  {errors.passengerPhone && <span className="error-message">{errors.passengerPhone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="passengerEmail">Email Address *</label>
                  <input
                    type="email"
                    id="passengerEmail"
                    name="passengerEmail"
                    value={bookingData.passengerEmail}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={errors.passengerEmail ? 'error' : ''}
                  />
                  {errors.passengerEmail && <span className="error-message">{errors.passengerEmail}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyName">Emergency Contact Name *</label>
                  <input
                    type="text"
                    id="emergencyName"
                    name="emergencyName"
                    value={bookingData.emergencyName}
                    onChange={handleChange}
                    placeholder="Emergency contact name"
                    className={errors.emergencyName ? 'error' : ''}
                  />
                  {errors.emergencyName && <span className="error-message">{errors.emergencyName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact">Emergency Contact Number *</label>
                  <input
                    type="tel"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={bookingData.emergencyContact}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    className={errors.emergencyContact ? 'error' : ''}
                  />
                  {errors.emergencyContact && <span className="error-message">{errors.emergencyContact}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="specialRequests">Special Requests (Optional)</label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleChange}
                    placeholder="Any special requirements or notes"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="step-panel">
              <h2>Payment Method</h2>
              
              <div className="payment-methods">
                <label className={`payment-option ${bookingData.paymentMethod === 'wallet' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={bookingData.paymentMethod === 'wallet'}
                    onChange={handleChange}
                  />
                  <div className="payment-card">
                    <span className="payment-icon">💳</span>
                    <div>
                      <div className="payment-name">Wallet</div>
                      <div className="payment-desc">Balance: ₹5,000</div>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${bookingData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={bookingData.paymentMethod === 'upi'}
                    onChange={handleChange}
                  />
                  <div className="payment-card">
                    <span className="payment-icon">📱</span>
                    <div>
                      <div className="payment-name">UPI</div>
                      <div className="payment-desc">Pay via UPI ID</div>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${bookingData.paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={bookingData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <div className="payment-card">
                    <span className="payment-icon">💳</span>
                    <div>
                      <div className="payment-name">Credit/Debit Card</div>
                      <div className="payment-desc">Visa, MasterCard, RuPay</div>
                    </div>
                  </div>
                </label>
              </div>

              {bookingData.paymentMethod === 'upi' && (
                <div className="payment-form">
                  <div className="form-group">
                    <label htmlFor="upiId">UPI ID</label>
                    <input
                      type="text"
                      id="upiId"
                      name="upiId"
                      value={bookingData.upiId}
                      onChange={handleChange}
                      placeholder="yourname@upi"
                      className={errors.upiId ? 'error' : ''}
                    />
                    {errors.upiId && <span className="error-message">{errors.upiId}</span>}
                  </div>
                </div>
              )}

              {bookingData.paymentMethod === 'card' && (
                <div className="payment-form">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={bookingData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cardExpiry">Expiry</label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        value={bookingData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className={errors.cardExpiry ? 'error' : ''}
                      />
                      {errors.cardExpiry && <span className="error-message">{errors.cardExpiry}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardCVV">CVV</label>
                      <input
                        type="text"
                        id="cardCVV"
                        name="cardCVV"
                        value={bookingData.cardCVV}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength="3"
                        className={errors.cardCVV ? 'error' : ''}
                      />
                      {errors.cardCVV && <span className="error-message">{errors.cardCVV}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="payment-summary">
                <div className="summary-row">
                  <span>Ride Fare ({bookingData.seats} seats)</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="summary-row">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="summary-row">
                  <span>GST (18%)</span>
                  <span>₹{gst}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="step-panel confirmation">
              <div className="success-animation">
                <div className="success-checkmark">
                  <div className="check-icon">✓</div>
                </div>
                <h2>Booking Confirmed!</h2>
                <p>Your booking has been successfully confirmed</p>
              </div>

              <div className="booking-receipt">
                <div className="receipt-header">
                  <h3>Booking Receipt</h3>
                  <div className="booking-id">ID: #{bookingId || 'BOOK12345'}</div>
                </div>

                <div className="receipt-section">
                  <h4>Ride Details</h4>
                  <div className="receipt-row">
                    <span>From</span>
                    <span>{selectedRide.from}</span>
                  </div>
                  <div className="receipt-row">
                    <span>To</span>
                    <span>{selectedRide.to}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Date & Time</span>
                    <span>{selectedRide.date} at {selectedRide.time}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Seats</span>
                    <span>{bookingData.seats}</span>
                  </div>
                </div>

                <div className="receipt-section">
                  <h4>Payment</h4>
                  <div className="receipt-row">
                    <span>Method</span>
                    <span className="capitalize">{bookingData.paymentMethod}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Amount Paid</span>
                    <span className="amount">₹{finalAmount}</span>
                  </div>
                </div>

                <div className="receipt-actions">
                  <button className="btn-download" onClick={downloadReceipt}>
                    📥 Download Receipt
                  </button>
                  <button className="btn-view" onClick={() => navigate('/bookings/my-bookings')}>
                    View My Bookings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="wizard-actions">
            {currentStep > 1 && (
              <button className="btn-back" onClick={handleBack} disabled={loading}>
                ← Back
              </button>
            )}
            {currentStep < 3 && (
              <button className="btn-next" onClick={handleNext}>
                Next →
              </button>
            )}
            {currentStep === 3 && (
              <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : `Pay ₹${finalAmount}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
