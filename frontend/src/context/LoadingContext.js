import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
export const LoadingContext = createContext();

// Custom hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

// Provider component
export const LoadingProvider = ({ children }) => {
  const [isWakingUp, setIsWakingUp] = useState(false);
  
  // Listen for service waking up events
  useEffect(() => {
    const handleWakingUpEvent = (event) => {
      setIsWakingUp(event.detail.isWakingUp);
      window.wakingUpNotificationShown = event.detail.isWakingUp;
    };
    
    // Add event listener
    window.addEventListener('serviceWakingUp', handleWakingUpEvent);
    
    // Cleanup
    return () => {
      window.removeEventListener('serviceWakingUp', handleWakingUpEvent);
    };
  }, []);
  
  return (
    <LoadingContext.Provider value={{ isWakingUp, setIsWakingUp }}>
      {isWakingUp && (
        <div className="wakeup-notification">
          <div className="wakeup-content">
            <div className="spinner"></div>
            <p>Service is waking up from sleep mode...</p>
            <p className="wakeup-info">This may take 30-60 seconds as we're using Render's free tier.</p>
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
