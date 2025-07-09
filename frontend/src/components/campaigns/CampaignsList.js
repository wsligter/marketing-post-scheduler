import React from 'react';

const CampaignsList = ({ campaigns, loading, error, onEditCampaign, onDeleteCampaign }) => {
  const handleEditClick = (campaign) => {
    if (onEditCampaign) {
      onEditCampaign(campaign);
    }
  };

  // Delete functionality moved to CampaignForm component

  if (loading) {
    return <div className="loading">Loading campaigns...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (campaigns.length === 0) {
    return <div className="no-campaigns">No campaigns found. Create your first one!</div>;
  }

  return (
    <div className="campaigns-grid">
      {campaigns.map((campaign) => (
        <div 
          key={campaign._id} 
          className="campaign-card"
          onClick={() => handleEditClick(campaign)}
        >
          <h3 className="campaign-title">{campaign.name}</h3>
          <p className="campaign-description">{campaign.description}</p>
          <div className="campaign-details">
            <div className="campaign-status-row">
              <span className="campaign-title-placeholder"></span>
              <span className={`status-badge ${campaign.status}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampaignsList;
