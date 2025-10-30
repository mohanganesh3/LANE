import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './Settings.css';

/**
 * Settings Page
 * User settings and preferences management
 */
const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: true,
      push: true,
      bookingUpdates: true,
      promotions: false,
      newsletters: false
    },
    privacy: {
      profileVisibility: 'public',
      showPhoneNumber: false,
      showEmail: false
    },
    preferences: {
      language: 'en',
      theme: 'light',
      currency: 'INR',
      distanceUnit: 'km'
    }
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/user/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.put('/user/settings', settings);
      showMessage('success', 'Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account preferences and privacy</p>
        </div>

        {message.text && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-sections">
          {/* Notifications Section */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div>
                <h2>Notifications</h2>
                <p>Choose how you want to be notified</p>
              </div>
            </div>
            
            <div className="settings-items">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Email Notifications</label>
                  <span>Receive updates via email</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>SMS Notifications</label>
                  <span>Get text messages for important updates</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, sms: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Push Notifications</label>
                  <span>Receive push notifications on your device</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, push: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Booking Updates</label>
                  <span>Get notified about ride status changes</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.bookingUpdates}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, bookingUpdates: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Promotions</label>
                  <span>Receive promotional offers and discounts</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.promotions}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, promotions: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Newsletters</label>
                  <span>Subscribe to our newsletter</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newsletters}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, newsletters: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h2>Privacy</h2>
                <p>Control your privacy and data settings</p>
              </div>
            </div>
            
            <div className="settings-items">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Profile Visibility</label>
                  <span>Choose who can see your profile</span>
                </div>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, profileVisibility: e.target.value }
                  })}
                  className="select-input"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Show Phone Number</label>
                  <span>Display phone number on your profile</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showPhoneNumber}
                    onChange={(e) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showPhoneNumber: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Show Email Address</label>
                  <span>Display email on your public profile</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showEmail: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                </svg>
              </div>
              <div>
                <h2>Preferences</h2>
                <p>Customize your app experience</p>
              </div>
            </div>
            
            <div className="settings-items">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Language</label>
                  <span>Choose your preferred language</span>
                </div>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, language: e.target.value }
                  })}
                  className="select-input"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Currency</label>
                  <span>Display prices in your currency</span>
                </div>
                <select
                  value={settings.preferences.currency}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, currency: e.target.value }
                  })}
                  className="select-input"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Distance Unit</label>
                  <span>Choose how to display distances</span>
                </div>
                <select
                  value={settings.preferences.distanceUnit}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, distanceUnit: e.target.value }
                  })}
                  className="select-input"
                >
                  <option value="km">Kilometers</option>
                  <option value="mi">Miles</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Theme</label>
                  <span>Choose your preferred theme</span>
                </div>
                <div className="theme-selector">
                  <button
                    className={`theme-option ${settings.preferences.theme === 'light' ? 'active' : ''}`}
                    onClick={() => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, theme: 'light' }
                    })}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                    <span>Light</span>
                  </button>

                  <button
                    className={`theme-option ${settings.preferences.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, theme: 'dark' }
                    })}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                    <span>Dark</span>
                  </button>

                  <button
                    className={`theme-option ${settings.preferences.theme === 'auto' ? 'active' : ''}`}
                    onClick={() => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, theme: 'auto' }
                    })}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    <span>Auto</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            className="btn-cancel"
            onClick={fetchSettings}
            disabled={saving}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
