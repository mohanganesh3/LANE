import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBookings.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0
  });

  // Fetch bookings based on filters
  const fetchBookings = async (status = 'all', page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10
      };
      
      if (status !== 'all') {
        params.status = status;
      }

      const response = await axios.get('/api/admin/bookings', { params });
      
      setBookings(response.data.bookings || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setCurrentPage(response.data.pagination?.page || 1);
      
      // Calculate stats
      const allBookings = response.data.allBookings || response.data.bookings || [];
      setStats({
        total: allBookings.length,
        pending: allBookings.filter(b => b.status === 'PENDING').length,
        confirmed: allBookings.filter(b => b.status === 'CONFIRMED').length,
        cancelled: allBookings.filter(b => b.status === 'CANCELLED').length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
      
      // Generate mock data for development
      const mockBookings = generateMockBookings(status);
      setBookings(mockBookings);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchBookings(currentStatus, currentPage);
  }, [currentStatus, currentPage]);

  const generateMockBookings = (status) => {
    const statuses = status === 'all' 
      ? ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
      : [status];
    
    const routes = [
      { from: 'Koramangala', to: 'Whitefield' },
      { from: 'Indiranagar', to: 'Electronic City' },
      { from: 'Jayanagar', to: 'Yelahanka' },
      { from: 'HSR Layout', to: 'Manyata Tech Park' },
      { from: 'BTM Layout', to: 'Marathahalli' }
    ];

    const passengers = [
      { firstName: 'Rahul', lastName: 'Sharma' },
      { firstName: 'Priya', lastName: 'Patel' },
      { firstName: 'Amit', lastName: 'Kumar' },
      { firstName: 'Sneha', lastName: 'Reddy' },
      { firstName: 'Vikram', lastName: 'Singh' }
    ];

    return Array.from({ length: 8 }, (_, i) => {
      const route = routes[i % routes.length];
      const passenger = passengers[i % passengers.length];
      const bookingStatus = statuses[i % statuses.length];
      
      return {
        _id: `mock${i}${Date.now()}`,
        passenger: {
          profile: passenger
        },
        ride: {
          origin: { address: route.from },
          destination: { address: route.to },
          departureTime: new Date(Date.now() + (i + 1) * 86400000).toISOString()
        },
        seatsBooked: Math.floor(Math.random() * 3) + 1,
        pricing: {
          total: 200 + (i * 50)
        },
        payment: {
          status: bookingStatus === 'CONFIRMED' ? 'PAID' : 'PENDING'
        },
        status: bookingStatus,
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString()
      };
    });
  };

  const handleStatusFilter = (status) => {
    setCurrentStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'PENDING': 'badge-pending',
      'CONFIRMED': 'badge-confirmed',
      'CANCELLED': 'badge-cancelled',
      'COMPLETED': 'badge-completed',
      'PICKED_UP': 'badge-confirmed',
      'DROPPED_OFF': 'badge-completed'
    };
    return statusMap[status] || 'badge-pending';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBookingId = (id) => {
    return id.toString().slice(-8).toUpperCase();
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="admin-bookings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bookings-container">
      <div className="page-header">
        <h1>Bookings Management</h1>
        <p className="subtitle">Manage and track all ride bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${currentStatus === 'all' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('all')}
        >
          <span className="tab-icon">📊</span>
          All Bookings
          <span className="tab-count">{stats.total}</span>
        </button>
        <button
          className={`tab ${currentStatus === 'PENDING' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('PENDING')}
        >
          <span className="tab-icon">🕐</span>
          Pending
          <span className="tab-count">{stats.pending}</span>
        </button>
        <button
          className={`tab ${currentStatus === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('CONFIRMED')}
        >
          <span className="tab-icon">✅</span>
          Confirmed
          <span className="tab-count">{stats.confirmed}</span>
        </button>
        <button
          className={`tab ${currentStatus === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('CANCELLED')}
        >
          <span className="tab-icon">❌</span>
          Cancelled
          <span className="tab-count">{stats.cancelled}</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {bookings.length > 0 ? (
          <>
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">
                    <strong>Booking #{getBookingId(booking._id)}</strong>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="booking-info">
                  <div className="info-item">
                    <i className="fas fa-user icon"></i>
                    <div className="info-details">
                      <span className="info-label">Passenger</span>
                      <span className="info-value">
                        {booking.passenger?.profile?.firstName || 'Unknown'}{' '}
                        {booking.passenger?.profile?.lastName || ''}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-route icon"></i>
                    <div className="info-details">
                      <span className="info-label">Route</span>
                      <span className="info-value">
                        {booking.ride?.origin?.address || 'Unknown'} → {booking.ride?.destination?.address || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-chair icon"></i>
                    <div className="info-details">
                      <span className="info-label">Seats</span>
                      <span className="info-value">{booking.seatsBooked || 1} seat(s)</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-rupee-sign icon"></i>
                    <div className="info-details">
                      <span className="info-label">Price</span>
                      <span className="info-value">₹{booking.pricing?.total || 0}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-credit-card icon"></i>
                    <div className="info-details">
                      <span className="info-label">Payment</span>
                      <span className="info-value">{booking.payment?.status || 'PENDING'}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-calendar icon"></i>
                    <div className="info-details">
                      <span className="info-label">Booked On</span>
                      <span className="info-value">{formatDate(booking.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button
                    className="btn-view"
                    onClick={() => viewBookingDetails(booking)}
                  >
                    <i className="fas fa-eye"></i>
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                  Previous
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <i className="fas fa-bookmark"></i>
            <h3>No Bookings Found</h3>
            <p>No bookings match your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Booking Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Booking ID:</span>
                    <span className="detail-value">#{getBookingId(selectedBooking._id)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`badge ${getStatusBadgeClass(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Booked On:</span>
                    <span className="detail-value">{formatDate(selectedBooking.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Seats Booked:</span>
                    <span className="detail-value">{selectedBooking.seatsBooked}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Passenger Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {selectedBooking.passenger?.profile?.firstName}{' '}
                      {selectedBooking.passenger?.profile?.lastName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedBooking.passenger?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Ride Information</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">From:</span>
                    <span className="detail-value">{selectedBooking.ride?.origin?.address}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">To:</span>
                    <span className="detail-value">{selectedBooking.ride?.destination?.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Departure:</span>
                    <span className="detail-value">
                      {formatDate(selectedBooking.ride?.departureTime)} at{' '}
                      {formatTime(selectedBooking.ride?.departureTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">₹{selectedBooking.pricing?.total || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Status:</span>
                    <span className="detail-value">{selectedBooking.payment?.status || 'PENDING'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{selectedBooking.payment?.method || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
