import React, { useState } from 'react';
import './TripShare.css';

/**
 * TripShare Component
 * Allows users to share trip details via various platforms
 */
const TripShare = ({ trip }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate shareable trip link
  const getTripLink = () => {
    return `${window.location.origin}/trips/${trip._id}/shared`;
  };

  // Generate share text
  const getShareText = () => {
    const pickup = trip.pickupLocation?.address?.substring(0, 50) || 'Pickup location';
    const dropoff = trip.dropoffLocation?.address?.substring(0, 50) || 'Dropoff location';
    const date = new Date(trip.completedAt || Date.now()).toLocaleDateString('en-IN');
    
    return `I just completed a ride with LANE!\n\n` +
           `📍 From: ${pickup}\n` +
           `📍 To: ${dropoff}\n` +
           `📅 Date: ${date}\n` +
           `🚗 Distance: ${trip.distance?.toFixed(2) || 0} km\n\n` +
           `View trip details: ${getTripLink()}`;
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getTripLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getTripLink();
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Fallback copy failed:', e);
      }
      document.body.removeChild(textArea);
    }
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Share via Twitter
  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Just completed a ride with LANE! 🚗\n\n${getTripLink()}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  // Share via Facebook
  const shareViaFacebook = () => {
    const url = encodeURIComponent(getTripLink());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  // Share via Email
  const shareViaEmail = () => {
    const subject = encodeURIComponent('My LANE Trip Details');
    const body = encodeURIComponent(getShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Share via SMS
  const shareViaSMS = () => {
    const text = encodeURIComponent(getShareText());
    window.location.href = `sms:?body=${text}`;
  };

  // Share via native share API
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My LANE Trip',
          text: getShareText(),
          url: getTripLink(),
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Native share failed:', err);
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  return (
    <div className="trip-share-container">
      <button
        className="btn-share-trip"
        onClick={shareNative}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share Trip Details
      </button>

      {showShareMenu && (
        <div className="share-menu-overlay" onClick={() => setShowShareMenu(false)}>
          <div className="share-menu" onClick={(e) => e.stopPropagation()}>
            <div className="share-menu-header">
              <h3>Share Trip</h3>
              <button
                className="close-share-menu"
                onClick={() => setShowShareMenu(false)}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="share-options">
              {/* WhatsApp */}
              <button className="share-option whatsapp" onClick={shareViaWhatsApp}>
                <div className="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span>WhatsApp</span>
              </button>

              {/* Twitter */}
              <button className="share-option twitter" onClick={shareViaTwitter}>
                <div className="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <span>Twitter</span>
              </button>

              {/* Facebook */}
              <button className="share-option facebook" onClick={shareViaFacebook}>
                <div className="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span>Facebook</span>
              </button>

              {/* Email */}
              <button className="share-option email" onClick={shareViaEmail}>
                <div className="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <span>Email</span>
              </button>

              {/* SMS */}
              <button className="share-option sms" onClick={shareViaSMS}>
                <div className="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span>SMS</span>
              </button>

              {/* Copy Link */}
              <button className="share-option copy-link" onClick={copyToClipboard}>
                <div className="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {copied ? (
                      <polyline points="20 6 9 17 4 12"/>
                    ) : (
                      <>
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </>
                    )}
                  </svg>
                </div>
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripShare;
