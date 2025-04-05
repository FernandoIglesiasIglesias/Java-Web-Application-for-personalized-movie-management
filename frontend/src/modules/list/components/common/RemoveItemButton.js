import React from 'react';
import './RemoveItemButton.css';

const RemoveItemButton = ({ onRemove, itemType = 'item', theme = 'light' }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onRemove) onRemove(e);
  };

  return (
    <button 
      className={`remove-item-button ${theme}`}
      onClick={handleClick}
      aria-label={`Eliminar ${itemType}`}
    >
      <span className="remove-icon">×</span>
    </button>
  );
};

export default RemoveItemButton;