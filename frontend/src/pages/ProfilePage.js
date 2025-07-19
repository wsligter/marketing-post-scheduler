import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { timezones } from '../utils/timezones';
import '../styles/Auth.css';

const ProfilePage = () => {
  const { user, updateProfile, error, setError } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('Europe/Amsterdam');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      // Use Europe/Amsterdam as the default if user timezone is empty
      setTimezone(user.timezone || 'Europe/Amsterdam');
    }
  }, [user]);
  
  // Clear any previous errors when component mounts
  useEffect(() => {
    setError(null);
    setSuccessMessage('');
  }, [setError]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccessMessage('');
    
    // Validate form
    if (!firstName || !lastName || !email) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate password if the user is trying to change it
    if (newPassword) {
      if (!currentPassword) {
        setError('Current password is required to set a new password');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare update data
      const updateData = {
        firstName,
        lastName,
        email,
        timezone
      };
      
      // Add password data if the user is changing their password
      if (newPassword && currentPassword) {
        updateData.currentPassword = currentPassword;
        updateData.password = newPassword;
      }
      
      const success = await updateProfile(updateData);
      
      if (success) {
        setSuccessMessage('Profile updated successfully');
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container" style={{ maxWidth: '600px' }}>
        <h2>My Profile</h2>
        
        {error && <div className="auth-error">{error}</div>}
        {successMessage && <div className="auth-success">{successMessage}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name*</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name*</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="timezone">Timezone*</label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={isSubmitting}
              required
              className="form-select"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="form-help">Select your local timezone for accurate scheduling</p>
          </div>
          
          <h3>Change Password</h3>
          <p className="form-help">Leave blank if you don't want to change your password</p>
          
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="role-display">
              <label>Role:</label>
              <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
              <p className="form-help">Contact an administrator to change your role</p>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="small" text="" />
                <span style={{ marginLeft: '8px' }}>Saving...</span>
              </>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
