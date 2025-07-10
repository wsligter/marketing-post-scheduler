import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import './styles/UserMenu.css';
import './styles/AdminPanel.css';
import { CampaignsPage, PostSchedulerPage, LoginPage, ProfilePage, AdminPanel } from './pages';
import logo from './assets/logo.svg';
// Import package.json version
import packageInfo from '../package.json';
// Import auth context
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      <header className="App-header">
        <div className="brand-container">
          <img src={logo} alt="KODIFY Logo" className="brand-logo" />
          <h1> Marketing Scheduler</h1>
        </div>
        {user ? (
          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/campaigns">Campaigns</Link>
              </li>
              <li>
                <Link to="/social-media">Post Scheduler</Link>
              </li>
              <li className="user-menu">
                <span>{user.firstName} {user.lastName}</span>
                <div className="user-dropdown">
                  <div className="user-role">{user.role}</div>
                  <Link to="/profile">My Profile</Link>
                  {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
                  <button onClick={logout} className="logout-button">Logout</button>
                </div>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/campaigns" /> : <LoginPage />} />
        
        {/* Default route redirects to campaigns */}
        <Route path="/" element={<Navigate to="/campaigns" />} />
        
        {/* Protected routes */}
        <Route path="/campaigns" element={<ProtectedRoute />}>
          <Route index element={<CampaignsPage />} />
        </Route>
        
        <Route path="/social-media" element={<ProtectedRoute />}>
          <Route index element={<PostSchedulerPage />} />
        </Route>
        
        <Route path="/profile" element={<ProtectedRoute />}>
          <Route index element={<ProfilePage />} />
        </Route>
        
        {/* Admin-only route */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
          <Route index element={<AdminPanel />} />
        </Route>
        
        {/* Redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to={user ? "/campaigns" : "/login"} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <footer className="App-footer">
          <div className="footer-content">
            <p>Marketing Scheduler v{packageInfo.version} -- Wouter Sligter, 2025</p>
          </div>
        </footer>
      </AuthProvider>
    </Router>
  );
}

export default App;
