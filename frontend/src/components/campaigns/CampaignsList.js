import React from 'react';

const CampaignsList = ({ campaigns = [], loading, error, onEditCampaign, onDeleteCampaign }) => {
  // Ensure campaigns is always an array
  const campaignsArray = Array.isArray(campaigns) ? campaigns : [];
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

  if (campaignsArray.length === 0) {
    return <div className="no-campaigns">No campaigns found. Create your first one!</div>;
  }

  console.log('Rendering campaigns list with:', campaignsArray);
  
  return (
    <div className="campaigns-grid">
      {campaignsArray.map((campaign) => {
        if (!campaign) {
          console.error('Undefined campaign in campaigns array');
          return null;
        }
        
        console.log('Campaign item:', campaign);
        
        // Safely get campaign properties with fallbacks
        const id = campaign._id || 'unknown-id';
        const name = campaign.name || 'Unnamed Campaign';
        const description = campaign.description || '';
        const status = campaign.status || 'draft';
        
        return (
          <div 
            key={id} 
            className="campaign-card"
            onClick={() => handleEditClick(campaign)}
          >
            <h3 className="campaign-title">{name}</h3>
            {description && <p className="campaign-description">{description}</p>}
            <div className="campaign-details">
              <div className="campaign-status-row">
                <span className="campaign-title-placeholder"></span>
                <span className={`status-badge ${status}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampaignsList;
