import React, { useState, useEffect } from 'react';
import { CampaignForm, CampaignsList } from '../components/campaigns';
import api from '../utils/api';
import '../styles/campaigns.css';

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      console.log('Fetching campaigns...');
      const token = localStorage.getItem('token');
      console.log('Auth token exists:', token ? 'Yes' : 'No');
      console.log('Auth token preview:', token ? `${token.substring(0, 10)}...` : 'None');
      
      // Log headers that will be sent
      console.log('Request will include headers:', {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token.substring(0, 10)}...` : 'None'
      });
      
      const response = await api.get('/api/campaigns');
      
      console.log('Campaigns API response status:', response.status);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Check if we got HTML instead of JSON
      if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
        console.error('Received HTML instead of JSON. API URL might be incorrect or CORS issue.');
        console.error('First 100 chars of response:', response.data.substring(0, 100));
        throw new Error('Received HTML instead of JSON. API URL might be incorrect.');
      }
      
      // Ensure we always set campaigns as an array
      const campaignsArray = Array.isArray(response.data) ? response.data : [];
      console.log('Campaigns array length:', campaignsArray.length);
      if (campaignsArray.length > 0) {
        console.log('First campaign sample:', campaignsArray[0]);
      }
      
      setCampaigns(campaignsArray);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching campaigns:', err.message);
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
        console.error('Error data:', typeof err.response.data === 'string' 
          ? err.response.data.substring(0, 100) + '...' 
          : err.response.data);
      } else if (err.request) {
        console.error('No response received, request was:', err.request);
      }
      
      setError(`Error fetching campaigns: ${err.message}`);
      setCampaigns([]); // Set empty array on error
      setLoading(false);
    }
  };

  const handleCampaignCreated = (newCampaign) => {
    console.log('Campaign created:', newCampaign);
    setCampaigns(prevCampaigns => [...prevCampaigns, newCampaign]);
  };
  
  const handleCampaignUpdated = (updatedCampaign) => {
    setCampaigns(campaigns.map(campaign => 
      campaign._id === updatedCampaign._id ? updatedCampaign : campaign
    ));
  };
  
  const handleDeleteCampaign = (campaignId) => {
    setCampaigns(campaigns.filter(campaign => campaign._id !== campaignId));
  };
  
  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    
    // Scroll to the form
    document.querySelector('.campaign-form-container').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="campaign-manager">
      <div className="scheduler-container">
        <div className="form-section">
          <CampaignForm 
            onCampaignCreated={handleCampaignCreated}
            onCampaignUpdated={handleCampaignUpdated}
            onDeleteCampaign={handleDeleteCampaign}
            editingCampaign={editingCampaign}
            setEditingCampaign={setEditingCampaign}
          />
        </div>

        <div className="posts-section">
          <div className="posts-list">
            <h2>Your Campaigns</h2>
            <CampaignsList 
              campaigns={campaigns || []}
              loading={loading}
              error={error}
              onEditCampaign={handleEditCampaign}
              onDeleteCampaign={handleDeleteCampaign}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignsPage;
