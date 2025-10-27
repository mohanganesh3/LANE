import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PaymentInterface.css';

const PaymentInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.booking;

  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('WALLET');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    if (!bookingData) {
      navigate('/rides/search');
      return;
    }
    fetchWalletBalance();
  }, [bookingData, navigate]);

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get('/api/user/wallet');
      setWalletBalance(response.data.balance || 0);
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setWalletBalance(1500); // Mock balance for development
    }
  };

  const paymentMethods = [
    {
      id: 'WALLET',
      name: 'LANE Wallet',
      icon: 'fa-wallet',
      description: `Balance: ₹${walletBalance.toFixed(2)}`,
      available: walletBalance >= (bookingData?.totalPrice || 0)
    },
    {
      id: 'UPI',
      name: 'UPI Payment',
      icon: 'fa-mobile-alt',
      description: 'GooglePay, PhonePe, Paytm',
      available: true
    },
    {
      id: 'CARD',
      name: 'Credit/Debit Card',
      icon: 'fa-credit-card',
      description: 'Visa, Mastercard, RuPay',
      available: true
    },
    {
      id: 'CASH',
      name: 'Cash on Ride',
      icon: 'fa-money-bill-wave',
      description: 'Pay driver directly',
      available: true
    }
  ];

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setCardDetails({ ...cardDetails, number: value });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      setCardDetails({ ...cardDetails, expiry: value });
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardDetails({ ...cardDetails, cvv: value });
    }
  };

  const validatePayment = () => {
    if (selectedMethod === 'WALLET') {
      if (walletBalance < (bookingData?.totalPrice || 0)) {
        setError('Insufficient wallet balance. Please add money or choose another method.');
        return false;
      }
    } else if (selectedMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., user@paytm)');
        return false;
      }
    } else if (selectedMethod === 'CARD') {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      if (!cardDetails.name || cardDetails.name.length < 3) {
        setError('Please enter cardholder name');
        return false;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
        setError('Please enter valid expiry date (MM/YY)');
        return false;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
        setError('Please enter valid 3-digit CVV');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    setError('');
    
    if (!validatePayment()) {
      return;
    }

    setProcessingPayment(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      const paymentPayload = {
        bookingId: bookingData._id,
        method: selectedMethod,
        amount: bookingData.totalPrice,
        ...(selectedMethod === 'UPI' && { upiId }),
        ...(selectedMethod === 'CARD' && { 
          cardLast4: cardDetails.number.replace(/\s/g, '').slice(-4),
          cardHolder: cardDetails.name
        })
      };

      const response = await axios.post('/api/bookings/payment', paymentPayload);
      
      setPaymentSuccess(true);
      setTimeout(() => {
        navigate('/bookings/confirmation', { 
          state: { 
            booking: response.data.booking,
            paymentMethod: selectedMethod
          } 
        });
      }, 2000);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  const priceBreakdown = bookingData ? {
    baseFare: bookingData.totalPrice / 1.23, // Reverse calculate
    platformFee: (bookingData.totalPrice / 1.23) * 0.05,
    gst: (bookingData.totalPrice / 1.23) * 1.05 * 0.18,
    total: bookingData.totalPrice
  } : null;

  if (!bookingData) {
    return null;
  }

  if (paymentSuccess) {
    return (
      <div className="payment-interface">
        <div className="success-animation">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
          <h2>Payment Successful!</h2>
          <p>Redirecting to confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-interface">
      <div className="payment-container">
        <div className="payment-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Complete Payment</h1>
        </div>

        <div className="payment-content">
          {/* Booking Summary */}
          <div className="booking-summary">
            <h3>Ride Summary</h3>
            <div className="route-info">
              <div className="route-point">
                <i className="fas fa-circle from-icon"></i>
                <span>{bookingData.pickupPoint?.address || 'Pickup Location'}</span>
              </div>
              <div className="route-line"></div>
              <div className="route-point">
                <i className="fas fa-map-marker-alt to-icon"></i>
                <span>{bookingData.dropoffPoint?.address || 'Dropoff Location'}</span>
              </div>
            </div>

            <div className="booking-details">
              <div className="detail-row">
                <span>Seats Booked:</span>
                <strong>{bookingData.seatsBooked}</strong>
              </div>
              <div className="detail-row">
                <span>Departure:</span>
                <strong>{new Date(bookingData.departureTime).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</strong>
              </div>
            </div>

            {priceBreakdown && (
              <div className="price-breakdown">
                <h4>Price Breakdown</h4>
                <div className="breakdown-item">
                  <span>Base Fare</span>
                  <span>₹{priceBreakdown.baseFare.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Platform Fee (5%)</span>
                  <span>₹{priceBreakdown.platformFee.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>GST (18%)</span>
                  <span>₹{priceBreakdown.gst.toFixed(2)}</span>
                </div>
                <div className="breakdown-total">
                  <span>Total Amount</span>
                  <strong>₹{priceBreakdown.total.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            
            <div className="methods-grid">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`method-card ${selectedMethod === method.id ? 'selected' : ''} ${!method.available ? 'disabled' : ''}`}
                  onClick={() => method.available && setSelectedMethod(method.id)}
                >
                  <div className="method-icon">
                    <i className={`fas ${method.icon}`}></i>
                  </div>
                  <div className="method-info">
                    <h4>{method.name}</h4>
                    <p className={!method.available ? 'insufficient' : ''}>
                      {method.description}
                    </p>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="check-mark">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Details Form */}
            {selectedMethod === 'UPI' && (
              <div className="payment-form">
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <div className="upi-apps">
                  <img src="/images/gpay.png" alt="GPay" onError={(e) => e.target.style.display = 'none'} />
                  <img src="/images/phonepe.png" alt="PhonePe" onError={(e) => e.target.style.display = 'none'} />
                  <img src="/images/paytm.png" alt="Paytm" onError={(e) => e.target.style.display = 'none'} />
                </div>
              </div>
            )}

            {selectedMethod === 'CARD' && (
              <div className="payment-form card-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={handleCardNumberChange}
                    maxLength="19"
                  />
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="JOHN DOE"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleExpiryChange}
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={handleCvvChange}
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'WALLET' && walletBalance < (bookingData?.totalPrice || 0) && (
              <div className="wallet-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Insufficient balance. Add ₹{((bookingData?.totalPrice || 0) - walletBalance).toFixed(2)} to proceed.</p>
                <button className="add-money-btn">Add Money to Wallet</button>
              </div>
            )}

            {selectedMethod === 'CASH' && (
              <div className="cash-notice">
                <i className="fas fa-info-circle"></i>
                <p>You can pay the driver in cash after completing the ride. Make sure to carry exact change.</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <button 
              className="pay-btn"
              onClick={handlePayment}
              disabled={processingPayment || (selectedMethod === 'WALLET' && walletBalance < (bookingData?.totalPrice || 0))}
            >
              {processingPayment ? (
                <>
                  <div className="spinner-small"></div>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-lock"></i>
                  {selectedMethod === 'CASH' ? 'Confirm Booking' : `Pay ₹${bookingData.totalPrice.toFixed(2)}`}
                </>
              )}
            </button>

            <div className="secure-notice">
              <i className="fas fa-shield-alt"></i>
              <span>Your payment is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInterface;
