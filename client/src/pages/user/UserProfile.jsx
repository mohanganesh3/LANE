import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profilePhoto: null,
    documents: {
      aadhar: null,
      license: null,
      vehicleRC: null
    },
    emergencyContacts: [
      { name: '', phone: '', relation: '' }
    ]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploadingPhoto(true);
    try {
      const response = await axios.post('/api/user/upload-photo', formData);
      if (response.data.success) {
        setProfile(prev => ({ ...prev, profilePhoto: response.data.photoUrl }));
        alert('Photo uploaded successfully!');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocumentUpload = async (docType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', docType);

    setUploadingDoc(true);
    try {
      const response = await axios.post('/api/user/upload-document', formData);
      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          documents: { ...prev.documents, [docType]: response.data.documentUrl }
        }));
        alert(`${docType} uploaded successfully!`);
      }
    } catch (error) {
      console.error('Document upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleEmergencyContactChange = (index, field, value) => {
    const updated = [...profile.emergencyContacts];
    updated[index][field] = value;
    setProfile(prev => ({ ...prev, emergencyContacts: updated }));
  };

  const addEmergencyContact = () => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relation: '' }]
    }));
  };

  const removeEmergencyContact = (index) => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.name?.trim()) newErrors.name = 'Name is required';
    if (!profile.email?.trim()) newErrors.email = 'Email is required';
    if (!profile.phone?.trim()) newErrors.phone = 'Phone is required';
    if (profile.phone?.length !== 10) newErrors.phone = 'Invalid phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.put('/api/user/profile', profile);
      if (response.data.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!isEditing && (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          {/* Profile Photo Section */}
          <div className="profile-section">
            <h2>Profile Photo</h2>
            <div className="photo-upload-area">
              <div className="photo-preview">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" />
                ) : (
                  <div className="photo-placeholder">
                    <span>👤</span>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="photo-actions">
                  <label className="btn-upload">
                    {uploadingPhoto ? 'Uploading...' : '📷 Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                  </label>
                  <p className="upload-hint">JPG, PNG or GIF. Max 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="profile-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength="10"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={profile.dateOfBirth || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={profile.address || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={profile.city || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={profile.state || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={profile.pincode || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="profile-section">
            <h2>Document Verification</h2>
            <div className="documents-grid">
              {[
                { key: 'aadhar', label: 'Aadhar Card', icon: '🆔' },
                { key: 'license', label: 'Driving License', icon: '🪪' },
                { key: 'vehicleRC', label: 'Vehicle RC', icon: '📄' }
              ].map((doc) => (
                <div key={doc.key} className="document-card">
                  <div className="doc-icon">{doc.icon}</div>
                  <div className="doc-label">{doc.label}</div>
                  {profile.documents[doc.key] ? (
                    <div className="doc-status verified">✓ Uploaded</div>
                  ) : (
                    <div className="doc-status pending">Pending</div>
                  )}
                  {isEditing && (
                    <label className="btn-upload-doc">
                      {uploadingDoc ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleDocumentUpload(doc.key, e)}
                        disabled={uploadingDoc}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Emergency Contacts</h2>
              {isEditing && (
                <button
                  type="button"
                  className="btn-add-contact"
                  onClick={addEmergencyContact}
                >
                  + Add Contact
                </button>
              )}
            </div>
            <div className="emergency-contacts">
              {profile.emergencyContacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-fields">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Contact Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="10-digit number"
                        maxLength="10"
                      />
                    </div>
                    <div className="form-group">
                      <label>Relation</label>
                      <input
                        type="text"
                        value={contact.relation}
                        onChange={(e) => handleEmergencyContactChange(index, 'relation', e.target.value)}
                        disabled={!isEditing}
                        placeholder="e.g., Father, Mother"
                      />
                    </div>
                  </div>
                  {isEditing && profile.emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-contact"
                      onClick={() => removeEmergencyContact(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
