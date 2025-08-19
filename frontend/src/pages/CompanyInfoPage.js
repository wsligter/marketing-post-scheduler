import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import AutoGrowTextarea from '../components/AutoGrowTextarea';
import '../styles/company-info.css';
import '../styles/auto-grow-textarea.css';

const CompanyInfoPage = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    location: '',
    vision: '',
    mission: '',
    toneOfVoice: ''
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchCompanyInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/company-info');
      setCompanyInfo({
        name: response.data.name || '',
        location: response.data.location || '',
        vision: response.data.vision || '',
        mission: response.data.mission || '',
        toneOfVoice: response.data.toneOfVoice || ''
      });
      setLastUpdated({
        date: response.data.updatedAt,
        user: response.data.updatedBy
      });
    } catch (err) {
      console.error('Error fetching company info:', err);
      showError('Failed to load company information');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchCompanyInfo();
  }, [fetchCompanyInfo]);

  const handleInputChange = (field, value) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/api/company-info', companyInfo);
      setLastUpdated({
        date: response.data.updatedAt,
        user: response.data.updatedBy
      });
      showSuccess('Company information updated successfully!');
    } catch (err) {
      console.error('Error updating company info:', err);
      showError(err.response?.data?.message || 'Failed to update company information');
    } finally {
      setSaving(false);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    const date = new Date(lastUpdated.date);
    const formattedDate = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    const userName = lastUpdated.user?.name || lastUpdated.user?.email || 'Unknown user';
    
    return `Last updated on ${formattedDate} by ${userName}`;
  };

  if (loading) {
    return (
      <div className="company-info-page page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-info-page page-container">
      <div className="company-info-container">
        <div className="page-header">
          <h1>Company Information</h1>
          <p className="page-description">
            Manage your company's core information. This information is shared across all users and can be used in AI-generated content.
          </p>
          {lastUpdated && (
            <p className="last-updated">{formatLastUpdated()}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="company-info-form">
          <div className="form-group">
            <label htmlFor="name">Company Name</label>
            <input
              type="text"
              id="name"
              value={companyInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your company name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={companyInfo.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter your company location"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="vision">Vision Statement</label>
            <AutoGrowTextarea
              id="vision"
              value={companyInfo.vision}
              onChange={(e) => handleInputChange('vision', e.target.value)}
              placeholder="Enter your company's vision statement"
              minRows={3}
              maxRows={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mission">Mission Statement</label>
            <AutoGrowTextarea
              id="mission"
              value={companyInfo.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              placeholder="Enter your company's mission statement"
              minRows={3}
              maxRows={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="toneOfVoice">Tone of Voice</label>
            <AutoGrowTextarea
              id="toneOfVoice"
              value={companyInfo.toneOfVoice}
              onChange={(e) => handleInputChange('toneOfVoice', e.target.value)}
              placeholder="Describe your company's tone of voice and communication style"
              minRows={4}
              maxRows={10}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Company Information'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfoPage;
