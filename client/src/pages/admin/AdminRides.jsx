import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminRides.css';

const AdminRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    searchQuery: '',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch rides with filters
  const fetchRides = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };

      // Remove 'all' status filter
      if (params.status === 'all') {
        delete params.status;
      }

      const response = await axios.get('/api/admin/rides', { params });
      
      setRides(response.data.rides || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rides:', error);
      setLoading(false);
      
      // Generate mock data
      const mockRides = generateMockRides();
      setRides(mockRides);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [currentPage, filters]);

  const generateMockRides = () => {
    const routes = [
      { from: 'Bangalore', to: 'Chennai' },
      { from: 'Mumbai', to: 'Pune' },
      { from: 'Delhi', to: 'Jaipur' },
      { from: 'Hyderabad', to: 'Vijayawada' },
      { from: 'Kolkata', to: 'Durgapur' }
    ];

    const riders = [
      { firstName: 'Rajesh', lastName: 'Kumar' },
      { firstName: 'Amit', lastName: 'Sharma' },
      { firstName: 'Vikram', lastName: 'Patel' },
      { firstName: 'Suresh', lastName: 'Reddy' },
      { firstName: 'Arun', lastName: 'Singh' }
    ];

    const statuses = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'];
    const vehicles = ['Sedan', 'SUV', 'Hatchback'];

    return Array.from({ length: 8 }, (_, i) => {
      const route = routes[i % routes.length];
      const rider = riders[i % riders.length];
      
      return {
        _id: `ride${i}${Date.now()}`,
        rider: {
          profile: rider
        },
        origin: { address: route.from },
        destination: { address: route.to },
        departureTime: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
        seats: {
          available: Math.floor(Math.random() * 3) + 1,
          total: 4
        },
        pricing: {
          pricePerSeat: 200 + (i * 50)
        },
        vehicle: {
          type: vehicles[i % vehicles.length],
          make: 'Honda',
          model: 'City',
          registrationNumber: `KA${10 + i}AB${1000 + i}`
        },
        status: statuses[i % statuses.length],
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString()
      };
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const viewRideDetails = (ride) => {
    setSelectedRide(ride);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRide(null);
  };

  const approveRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to approve this ride?')) {
      return;
    }

    try {
      await axios.put(`/api/admin/rides/${rideId}/approve`);
      fetchRides();
      
      // Close modal if open
      if (showModal) {
        closeModal();
      }
      
      alert('Ride approved successfully');
    } catch (error) {
      console.error('Error approving ride:', error);
      alert('Failed to approve ride. Please try again.');
    }
  };

  const rejectRide = async (rideId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) {
      return;
    }

    try {
      await axios.put(`/api/admin/rides/${rideId}/reject`, { reason });
      fetchRides();
      
      // Close modal if open
      if (showModal) {
        closeModal();
      }
      
      alert('Ride rejected successfully');
    } catch (error) {
      console.error('Error rejecting ride:', error);
      alert('Failed to reject ride. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'ACTIVE': 'badge-active',
      'COMPLETED': 'badge-completed',
      'CANCELLED': 'badge-cancelled',
      'PENDING': 'badge-pending'
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

  if (loading && rides.length === 0) {
    return (
      <div className="admin-rides-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-rides-container">
      <div className="page-header">
        <h1>Rides Management</h1>
        <p className="subtitle">Manage and monitor all posted rides</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Rides</option>
            <option value="PENDING">Pending Approval</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by location, rider..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>

        <button
          className="btn-reset"
          onClick={() => {
            setFilters({
              status: 'all',
              searchQuery: '',
              dateFrom: '',
              dateTo: ''
            });
            setCurrentPage(1);
          }}
        >
          <i className="fas fa-redo"></i>
          Reset
        </button>
      </div>

      {/* Rides List */}
      <div className="rides-list">
        {rides.length > 0 ? (
          <>
            {rides.map((ride) => (
              <div key={ride._id} className="ride-card">
                <div className="ride-header">
                  <div className="route">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{ride.origin?.address}</span>
                    <i className="fas fa-arrow-right"></i>
                    <span>{ride.destination?.address}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(ride.status)}`}>
                    {ride.status}
                  </span>
                </div>

                <div className="ride-info">
                  <div className="info-item">
                    <i className="fas fa-user icon"></i>
                    <div className="info-details">
                      <span className="info-label">Rider</span>
                      <span className="info-value">
                        {ride.rider?.profile?.firstName} {ride.rider?.profile?.lastName}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-calendar icon"></i>
                    <div className="info-details">
                      <span className="info-label">Departure</span>
                      <span className="info-value">
                        {formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-chair icon"></i>
                    <div className="info-details">
                      <span className="info-label">Available Seats</span>
                      <span className="info-value">
                        {ride.seats?.available}/{ride.seats?.total}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-rupee-sign icon"></i>
                    <div className="info-details">
                      <span className="info-label">Price/Seat</span>
                      <span className="info-value">₹{ride.pricing?.pricePerSeat}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-car icon"></i>
                    <div className="info-details">
                      <span className="info-label">Vehicle</span>
                      <span className="info-value">
                        {ride.vehicle?.type} - {ride.vehicle?.registrationNumber}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-clock icon"></i>
                    <div className="info-details">
                      <span className="info-label">Posted On</span>
                      <span className="info-value">{formatDate(ride.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="ride-actions">
                  <button
                    className="btn-view"
                    onClick={() => viewRideDetails(ride)}
                  >
                    <i className="fas fa-eye"></i>
                    View Details
                  </button>
                  
                  {ride.status === 'PENDING' && (
                    <>
                      <button
                        className="btn-approve"
                        onClick={() => approveRide(ride._id)}
                      >
                        <i className="fas fa-check"></i>
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => rejectRide(ride._id)}
                      >
                        <i className="fas fa-times"></i>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
            <i className="fas fa-car"></i>
            <h3>No Rides Found</h3>
            <p>No rides match your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Ride Details Modal */}
      {showModal && selectedRide && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ride Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Route Information</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">From:</span>
                    <span className="detail-value">{selectedRide.origin?.address}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">To:</span>
                    <span className="detail-value">{selectedRide.destination?.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Departure:</span>
                    <span className="detail-value">
                      {formatDate(selectedRide.departureTime)} at {formatTime(selectedRide.departureTime)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`badge ${getStatusBadgeClass(selectedRide.status)}`}>
                      {selectedRide.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Rider Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {selectedRide.rider?.profile?.firstName} {selectedRide.rider?.profile?.lastName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedRide.rider?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Vehicle & Pricing</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Vehicle Type:</span>
                    <span className="detail-value">{selectedRide.vehicle?.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vehicle Number:</span>
                    <span className="detail-value">{selectedRide.vehicle?.registrationNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Available Seats:</span>
                    <span className="detail-value">
                      {selectedRide.seats?.available}/{selectedRide.seats?.total}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price per Seat:</span>
                    <span className="detail-value">₹{selectedRide.pricing?.pricePerSeat}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedRide.status === 'PENDING' && (
                <>
                  <button
                    className="btn-approve"
                    onClick={() => {
                      approveRide(selectedRide._id);
                      closeModal();
                    }}
                  >
                    <i className="fas fa-check"></i>
                    Approve Ride
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => {
                      rejectRide(selectedRide._id);
                      closeModal();
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Reject Ride
                  </button>
                </>
              )}
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

export default AdminRides;
