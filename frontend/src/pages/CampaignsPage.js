import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CampaignForm, CampaignsList } from '../components/campaigns';
import config from '../config';
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
      const response = await axios.get(`${config.apiUrl}/api/campaigns`);
      // Ensure we always set campaigns as an array
      setCampaigns(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError('Error fetching campaigns');
      setCampaigns([]); // Set empty array on error
      setLoading(false);
      console.error('Error fetching campaigns:', err);
    }
  };

  const handleCampaignCreated = (newCampaign) => {
    setCampaigns([...campaigns, newCampaign]);
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
