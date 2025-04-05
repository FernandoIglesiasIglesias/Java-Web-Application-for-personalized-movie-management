import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../ListDetailsComponents/ListDetails.css';
import RemoveItemButton from '../../common/RemoveItemButton';

const ActorItem = ({ actor, theme, onRemove }) => {
  const navigate = useNavigate();
  const [hasImageError, setHasImageError] = useState(false);
  
  useEffect(() => {
    // Reset image error state when actor changes
    if (actor) {
      setHasImageError(false);
    }
  }, [actor]);
  
  // Verificar si actor es undefined antes de continuar
  if (!actor) {
    console.log("ActorItem recibió un actor undefined");
    return null;
  }
  
  const handleClick = () => {
    navigate(`/actors/${encodeURIComponent(actor.name || '')}`);
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
  
  // Para depurar el problema de la imagen
  console.log(`Actor ${actor.id} - ${actor.name}:`, {
    hasImage: !!actor.imageUrl,
    imageUrl: actor.imageUrl,
    hasError: hasImageError
  });

  return (
    <div className={`item-card actor-item ${theme}`} onClick={handleClick}>
      <div className="item-image-container">
        {actor.imageUrl && !hasImageError ? (
          <img
            src={actor.imageUrl}
            alt={actor.name || 'Actor'}
            className="item-image"
            onError={(e) => {
              console.log(`Error cargando imagen para actor ${actor.name}:`, e);
              e.target.onerror = null;
              setHasImageError(true);
              e.target.src = `https://via.placeholder.com/300x450/cccccc/666666?text=${getInitials(actor.name || 'Act')}`;
            }}
          />
        ) : (
          <div className="item-placeholder">
            <span>{getInitials(actor.name || 'Act')}</span>
          </div>
        )}
        
        <RemoveItemButton 
          onRemove={(e) => onRemove(actor.id, e)}
          itemType="actor"
          theme={theme}
        />
      </div>
      <div className="item-details">
        <h3 className="item-name">{actor.name || 'Actor sin nombre'}</h3>
        {actor.birthDate && (
          <p className="item-info">
            {new Date(actor.birthDate).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ActorItem;