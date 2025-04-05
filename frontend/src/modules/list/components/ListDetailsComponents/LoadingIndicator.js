import React from 'react';
import './ListDetails.css';

const LoadingIndicator = ({ message, theme }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message || 'Cargando...'}</p>
    </div>
  );
};

export default LoadingIndicator;