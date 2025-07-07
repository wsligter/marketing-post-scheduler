import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import './pages/CampaignManager.css';
import SocialMediaScheduler from './pages/SocialMediaScheduler';
import CampaignForm from './components/CampaignForm';
import CampaignsList from './components/CampaignsList';
import logo from './assets/logo.svg';
// Import package.json version
import packageInfo from '../package.json';

function App() {
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
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/campaigns`);
      setCampaigns(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching campaigns');
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
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="brand-container">
            <img src={logo} alt="KODIFY Logo" className="brand-logo" />
            <h1> Marketing Scheduler</h1>
          </div>
          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/">Campaigns</Link>
              </li>
              <li>
                <Link to="/social-media">Post Scheduler</Link>
              </li>
            </ul>
          </nav>
        </header>
        
        <Routes>
          <Route path="/social-media" element={<SocialMediaScheduler />} />
          <Route path="/" element={
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
                      campaigns={campaigns}
                      loading={loading}
                      error={error}
                      onEditCampaign={handleEditCampaign}
                      onDeleteCampaign={handleDeleteCampaign}
                    />
                  </div>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
      <footer className="App-footer">
        <div className="footer-content">
          <p>Marketing Scheduler v{packageInfo.version} -- Wouter Sligter, 2025</p>
        </div>
      </footer>
    </Router>
  );
}

export default App;
