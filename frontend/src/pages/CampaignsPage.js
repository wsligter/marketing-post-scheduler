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
      console.log('Auth token:', localStorage.getItem('token'));
      
      const response = await api.get('/api/campaigns');
      
      console.log('Campaigns API response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Ensure we always set campaigns as an array
      const campaignsArray = Array.isArray(response.data) ? response.data : [];
      console.log('Campaigns array to set:', campaignsArray);
      
      setCampaigns(campaignsArray);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Error status:', err.response ? err.response.status : 'No status');
      
      setError('Error fetching campaigns');
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
