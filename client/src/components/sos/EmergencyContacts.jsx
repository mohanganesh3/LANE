import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './EmergencyContacts.css';

/**
 * EmergencyContacts Component
 * Manage emergency contacts for SOS alerts
 */
const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const response = await apiService.get('/user/emergency-contacts');
      setContacts(response.data.contacts || []);
    } catch (err) {
      console.error('Failed to fetch emergency contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const response = await apiService.post('/user/emergency-contacts', formData);
      
      setContacts([...contacts, response.data.contact]);
      setShowAddForm(false);
      setFormData({ name: '', phone: '', relationship: '', email: '' });
      setErrors({});
    } catch (err) {
      console.error('Failed to add emergency contact:', err);
      alert('Failed to add contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to remove this emergency contact?')) return;
    
    try {
      await apiService.delete(`/user/emergency-contacts/${contactId}`);
      setContacts(contacts.filter(c => c._id !== contactId));
    } catch (err) {
      console.error('Failed to delete contact:', err);
      alert('Failed to remove contact. Please try again.');
    }
  };

  const handleSetPrimary = async (contactId) => {
    try {
      await apiService.put(`/user/emergency-contacts/${contactId}/set-primary`);
      
      // Update local state
      setContacts(contacts.map(c => ({
        ...c,
        isPrimary: c._id === contactId,
      })));
    } catch (err) {
      console.error('Failed to set primary contact:', err);
      alert('Failed to update contact. Please try again.');
    }
  };

  const relationships = [
    'Parent',
    'Spouse',
    'Sibling',
    'Child',
    'Friend',
    'Colleague',
    'Relative',
    'Other',
  ];

  if (loading && contacts.length === 0) {
    return (
      <div className="emergency-contacts-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading emergency contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-contacts-page">
      <div className="contacts-container">
        <div className="contacts-header">
          <div className="header-content">
            <h1>Emergency Contacts</h1>
            <p>Add trusted contacts who will be notified during emergencies</p>
          </div>
          <button
            className="btn-add-contact"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Contact'}
          </button>
        </div>

        {showAddForm && (
          <form className="add-contact-form" onSubmit={handleAddContact}>
            <h3>Add New Emergency Contact</h3>
            
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="relationship">
                Relationship <span className="required">*</span>
              </label>
              <select
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className={errors.relationship ? 'error' : ''}
              >
                <option value="">Select relationship</option>
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
              {errors.relationship && <span className="error-message">{errors.relationship}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Contact'}
              </button>
            </div>
          </form>
        )}

        {contacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>No Emergency Contacts Added</h3>
            <p>Add trusted contacts who will be notified when you trigger an emergency alert</p>
            <button className="btn-add-first" onClick={() => setShowAddForm(true)}>
              Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="contacts-list">
            <div className="contacts-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <p>These contacts will receive SMS and call alerts during emergencies</p>
            </div>

            {contacts.map((contact) => (
              <div key={contact._id} className={`contact-card ${contact.isPrimary ? 'primary' : ''}`}>
                <div className="contact-avatar">
                  <span>{contact.name.charAt(0).toUpperCase()}</span>
                </div>
                
                <div className="contact-info">
                  <div className="contact-name-row">
                    <h3>{contact.name}</h3>
                    {contact.isPrimary && (
                      <span className="primary-badge">Primary</span>
                    )}
                  </div>
                  <p className="contact-relationship">{contact.relationship}</p>
                  <div className="contact-details">
                    <a href={`tel:${contact.phone}`} className="contact-phone">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {contact.phone}
                    </a>
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="contact-email">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {contact.email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="contact-actions">
                  {!contact.isPrimary && (
                    <button
                      className="btn-set-primary"
                      onClick={() => handleSetPrimary(contact._id)}
                      title="Set as primary contact"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  )}
                  <button
                    className="btn-delete-contact"
                    onClick={() => handleDeleteContact(contact._id)}
                    title="Remove contact"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="contacts-footer">
          <div className="footer-info">
            <h4>How Emergency Contacts Work</h4>
            <ul>
              <li>Contacts receive instant SMS alerts when you trigger an emergency</li>
              <li>They get your live location updates throughout the emergency</li>
              <li>Primary contact receives calls from our emergency response team</li>
              <li>Add up to 5 contacts for maximum safety coverage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
