import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../ListDetailsComponents/ListDetails.css';
import RemoveItemButton from '../../common/RemoveItemButton';

const DirectorItem = ({ director, theme, onRemove }) => {
  const navigate = useNavigate();
  const [hasImageError, setHasImageError] = useState(false);
  
  useEffect(() => {
    // Reset image error state when director changes
    if (director) {
      setHasImageError(false);
    }
  }, [director]);
  
  // Verificar si director es undefined antes de continuar
  if (!director) {
    return null;
  }
  
  const handleClick = () => {
    navigate(`/directors/${encodeURIComponent(director.name || '')}`);
  };
  
  const getInitials = (name) => {
    if (!name) return "??";
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className={`item-card director-item ${theme}`} onClick={handleClick}>
      <div className="item-image-container">
        {director.imageUrl && !hasImageError ? (
          <img
            src={director.imageUrl}
            alt={director.name || 'Director'}
            className="item-image"
            onError={(e) => {
              e.target.onerror = null;
              setHasImageError(true);
              e.target.src = `https://via.placeholder.com/300x450/cccccc/666666?text=${getInitials(director.name || 'Dir')}`;
            }}
          />
        ) : (
          <div className="item-placeholder">
            <span>{getInitials(director.name || 'Dir')}</span>
          </div>
        )}
        
        <RemoveItemButton 
          onRemove={(e) => onRemove(director.id, e)}
          itemType="director"
          theme={theme}
        />
      </div>
      <div className="item-details">
        <h3 className="item-name">{director.name || 'Director sin nombre'}</h3>
        {director.birthDate && (
          <p className="item-info">
            {new Date(director.birthDate).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};

export default DirectorItem;