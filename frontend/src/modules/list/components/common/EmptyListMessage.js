import React from 'react';
import '../ListDetailsComponents/ListDetails.css';

const EmptyListMessage = ({ icon, message, suggestion }) => {
  return (
    <div className="no-items-container">
      <div className="no-items-icon">{icon}</div>
      <p className="no-items-message">{message}</p>
      <p className="no-items-suggestion">{suggestion}</p>
    </div>
  );
};

export default EmptyListMessage;