import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { CampaignsPage, PostSchedulerPage } from './pages';
import logo from './assets/logo.svg';
// Import package.json version
import packageInfo from '../package.json';

function App() {

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
          <Route path="/social-media" element={<PostSchedulerPage />} />
          <Route path="/" element={<CampaignsPage />} />
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
