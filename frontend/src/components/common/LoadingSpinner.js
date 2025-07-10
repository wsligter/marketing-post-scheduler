import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const spinnerClasses = `loading-spinner loading-spinner-${size}`;
  
  return (
    <div className="loading-container">
      <div className={spinnerClasses}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
