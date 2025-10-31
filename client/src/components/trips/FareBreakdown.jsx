import React, { useState } from 'react';
import './FareBreakdown.css';

/**
 * FareBreakdown Component
 * Displays detailed fare breakdown with pricing components
 */
const FareBreakdown = ({ trip, onClose }) => {
  const [showDetails, setShowDetails] = useState(true);

  // Calculate fare components
  const fareComponents = {
    baseFare: trip.baseFare || 50,
    distanceFare: trip.distanceFare || (trip.distance * 12),
    timeFare: trip.timeFare || (trip.actualDuration * 1.5),
    surgePricing: trip.surgePricing || 0,
    peakHourCharge: trip.peakHourCharge || 0,
    waitingCharges: trip.waitingCharges || 0,
    tollCharges: trip.tollCharges || 0,
    parkingFee: trip.parkingFee || 0,
    platformFee: trip.platformFee || 10,
    gst: 0,
    discount: trip.discount || 0,
    promoDiscount: trip.promoDiscount || 0,
  };

  // Calculate subtotal before taxes and discounts
  const subtotal = 
    fareComponents.baseFare +
    fareComponents.distanceFare +
    fareComponents.timeFare +
    fareComponents.surgePricing +
    fareComponents.peakHourCharge +
    fareComponents.waitingCharges +
    fareComponents.tollCharges +
    fareComponents.parkingFee +
    fareComponents.platformFee;

  // Calculate GST (18% in India)
  fareComponents.gst = subtotal * 0.18;

  // Calculate total
  const totalBeforeDiscount = subtotal + fareComponents.gst;
  const totalDiscount = fareComponents.discount + fareComponents.promoDiscount;
  const finalTotal = totalBeforeDiscount - totalDiscount;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Check if component should be displayed
  const shouldShow = (amount) => amount > 0;

  return (
    <div className="fare-breakdown-container">
      <div className="fare-header">
        <h3>Fare Breakdown</h3>
        <button 
          className="toggle-details"
          onClick={() => setShowDetails(!showDetails)}
          aria-label={showDetails ? 'Hide details' : 'Show details'}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {showDetails && (
        <div className="fare-details">
          {/* Base Charges */}
          <div className="fare-section">
            <h4>Base Charges</h4>
            
            <div className="fare-item">
              <div className="fare-item-label">
                <span>Base Fare</span>
                <span className="fare-item-info">Minimum charge for booking</span>
              </div>
              <span className="fare-item-value">{formatCurrency(fareComponents.baseFare)}</span>
            </div>

            <div className="fare-item">
              <div className="fare-item-label">
                <span>Distance Fare</span>
                <span className="fare-item-info">
                  ₹12/km × {trip.distance?.toFixed(2) || 0} km
                </span>
              </div>
              <span className="fare-item-value">{formatCurrency(fareComponents.distanceFare)}</span>
            </div>

            <div className="fare-item">
              <div className="fare-item-label">
                <span>Time Fare</span>
                <span className="fare-item-info">
                  ₹1.5/min × {trip.actualDuration || 0} min
                </span>
              </div>
              <span className="fare-item-value">{formatCurrency(fareComponents.timeFare)}</span>
            </div>
          </div>

          {/* Additional Charges */}
          {(shouldShow(fareComponents.surgePricing) || 
            shouldShow(fareComponents.peakHourCharge) || 
            shouldShow(fareComponents.waitingCharges) ||
            shouldShow(fareComponents.tollCharges) ||
            shouldShow(fareComponents.parkingFee)) && (
            <div className="fare-section">
              <h4>Additional Charges</h4>

              {shouldShow(fareComponents.surgePricing) && (
                <div className="fare-item">
                  <div className="fare-item-label">
                    <span>Surge Pricing</span>
                    <span className="fare-item-info surge">High demand area</span>
                  </div>
                  <span className="fare-item-value surge">
                    +{formatCurrency(fareComponents.surgePricing)}
                  </span>
                </div>
              )}

              {shouldShow(fareComponents.peakHourCharge) && (
                <div className="fare-item">
                  <div className="fare-item-label">
                    <span>Peak Hour Charge</span>
                    <span className="fare-item-info">Rush hour pricing</span>
                  </div>
                  <span className="fare-item-value">
                    +{formatCurrency(fareComponents.peakHourCharge)}
                  </span>
                </div>
              )}

              {shouldShow(fareComponents.waitingCharges) && (
                <div className="fare-item">
                  <div className="fare-item-label">
                    <span>Waiting Charges</span>
                    <span className="fare-item-info">₹2/min after 3 min</span>
                  </div>
                  <span className="fare-item-value">
                    +{formatCurrency(fareComponents.waitingCharges)}
                  </span>
                </div>
              )}

              {shouldShow(fareComponents.tollCharges) && (
                <div className="fare-item">
                  <div className="fare-item-label">
                    <span>Toll Charges</span>
                    <span className="fare-item-info">Highway tolls</span>
                  </div>
                  <span className="fare-item-value">
                    +{formatCurrency(fareComponents.tollCharges)}
                  </span>
                </div>
              )}

              {shouldShow(fareComponents.parkingFee) && (
                <div className="fare-item">
                  <div className="fare-item-label">
                    <span>Parking Fee</span>
                    <span className="fare-item-info">Parking charges</span>
                  </div>
                  <span className="fare-item-value">
                    +{formatCurrency(fareComponents.parkingFee)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Platform Fee & Taxes */}
          <div className="fare-section">
            <h4>Platform Fee & Taxes</h4>

            <div className="fare-item">
              <div className="fare-item-label">
                <span>Platform Fee</span>
                <span className="fare-item-info">Service fee</span>
              </div>
              <span className="fare-item-value">{formatCurrency(fareComponents.platformFee)}</span>
            </div>

            <div className="fare-item">
              <div className="fare-item-label">
                <span>GST (18%)</span>
                <span className="fare-item-info">Goods & Services Tax</span>
              </div>
              <span className="fare-item-value">{formatCurrency(fareComponents.gst)}</span>
            </div>
          </div>

          {/* Discounts */}
          {totalDiscount > 0 && (
            <div className="fare-section discounts">
              <h4>Discounts</h4>

              {shouldShow(fareComponents.discount) && (
                <div className="fare-item">
                  <div className="fare-item-label">
                    <span>Ride Discount</span>
                    <span className="fare-item-info success">Applied</span>
                  </div>
                  <span className="fare-item-value discount">
                    -{formatCurrency(fareComponents.discount)}
                  </span>
                </div>
              )}

              {shouldShow(fareComponents.promoDiscount) && (
                <div className="fare-item">
                  <div className="fare-item-label">
                    <span>Promo Code</span>
                    <span className="fare-item-info success">
                      {trip.promoCode || 'APPLIED'}
                    </span>
                  </div>
                  <span className="fare-item-value discount">
                    -{formatCurrency(fareComponents.promoDiscount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Subtotal */}
          <div className="fare-subtotal">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      )}

      {/* Total Amount */}
      <div className="fare-total">
        <div className="total-label">
          <span>Total Amount Paid</span>
          {trip.paymentMethod && (
            <span className="payment-method">
              via {trip.paymentMethod === 'cash' ? 'Cash' : 
                   trip.paymentMethod === 'card' ? 'Card' : 
                   trip.paymentMethod === 'wallet' ? 'Wallet' : 
                   trip.paymentMethod === 'upi' ? 'UPI' : 
                   trip.paymentMethod}
            </span>
          )}
        </div>
        <span className="total-amount">{formatCurrency(finalTotal)}</span>
      </div>

      {/* Savings Badge */}
      {totalDiscount > 0 && (
        <div className="savings-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
          You saved {formatCurrency(totalDiscount)} on this trip!
        </div>
      )}
    </div>
  );
};

export default FareBreakdown;
