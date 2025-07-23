import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import './App.css';
import './styles/UserMenu.css';
import './styles/AdminPanel.css';
import './styles/wakeup-notification.css';
import { CampaignsPage, PostSchedulerPage, LoginPage, ProfilePage, AdminPanel, CalendarViewPage, DashboardPage, CreateNewPage } from './pages';
import logo from './assets/kodify_logo_white.svg';
// Import package.json version
import packageInfo from '../package.json';
// Import auth context
import { AuthProvider, useAuth } from './context/AuthContext';
// Import loading context for free tier service wakeup notifications
import { LoadingProvider } from './context/LoadingContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppContent() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <div className="brand-container">
            <img src={logo} alt="KODIFY Logo" className="brand-logo" />
            <h1>Welcome</h1>
          </div>
        </div>
        
        {user ? (
          <div className="header-nav">
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            
            <nav className={`main-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              <ul>
                <li>
                  <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => isActive ? "active-link" : ""}
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/create-new" 
                    className={({ isActive }) => isActive ? "active-link" : ""}
                    onClick={closeMobileMenu}
                  >
                    Create New
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/campaigns" 
                    className={({ isActive }) => isActive ? "active-link" : ""}
                    onClick={closeMobileMenu}
                  >
                    Campaigns
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/social-media" 
                    className={({ isActive }) => isActive ? "active-link" : ""}
                    onClick={closeMobileMenu}
                  >
                    Post Scheduler
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/calendar" 
                    className={({ isActive }) => isActive ? "active-link" : ""}
                    onClick={closeMobileMenu}
                  >
                    Calendar View
                  </NavLink>
                </li>
                <li className="user-menu">
                  <span className="user-name">{user.firstName} {user.lastName}</span>
                  <div className="user-dropdown">
                    <div className="user-role">{user.role}</div>
                    <Link to="/profile" onClick={closeMobileMenu}>My Profile</Link>
                    {user.role === 'admin' && <Link to="/admin" onClick={closeMobileMenu}>Admin Panel</Link>}
                    <button onClick={() => { logout(); closeMobileMenu(); }} className="logout-button">Logout</button>
                  </div>
                </li>
              </ul>
            </nav>
            
            {isMobileMenuOpen && (
              <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
            )}
          </div>
        ) : null}
      </header>
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        
        {/* Default route redirects to login or dashboard based on authentication status */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
        </Route>
        
        <Route path="/create-new" element={<ProtectedRoute />}>
          <Route index element={<CreateNewPage />} />
        </Route>
        
        <Route path="/campaigns" element={<ProtectedRoute />}>
          <Route index element={<CampaignsPage />} />
        </Route>
        
        <Route path="/social-media" element={<ProtectedRoute />}>
          <Route index element={<PostSchedulerPage />} />
        </Route>
        
        <Route path="/calendar" element={<ProtectedRoute />}>
          <Route index element={<CalendarViewPage />} />
        </Route>
        
        <Route path="/profile" element={<ProtectedRoute />}>
          <Route index element={<ProfilePage />} />
        </Route>
        
        {/* Admin-only route */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
          <Route index element={<AdminPanel />} />
        </Route>
        
        {/* Redirect to dashboard if authenticated, login if not */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LoadingProvider>
          <AppContent />
          <footer className="App-footer">
            <div className="footer-content">
              <p>Marketing Tool v{packageInfo.version} -- Wouter Sligter, 2025</p>
            </div>
          </footer>
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
