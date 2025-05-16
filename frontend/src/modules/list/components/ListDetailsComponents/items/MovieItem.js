import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../ListDetails.css';
import RemoveItemButton from '../../common/RemoveItemButton';

const MovieItem = ({ movie, theme, onRemove }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/movies/${movie.imdbId || movie.id}`);
  };
  
  return (
    <div className={`item-card movie-item ${theme}`} onClick={handleClick}>
      <div className="item-image-container">
        <img
          src={movie.verticalPoster || "https://via.placeholder.com/300x450?text=Sin+Imagen"}
          alt={movie.title}
          className="item-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x450?text=Sin+Imagen";
          }}
        />
        
        <RemoveItemButton 
          onRemove={(e) => onRemove(movie.id, e)}
          itemType="película"
          theme={theme}
        />
      </div>
      <div className="item-details">
        <h3 className="item-name">{movie.title}</h3>
        {movie.releaseYear && (
          <p className="item-info">{movie.releaseYear}</p>
        )}
      </div>
    </div>
  );
};

export default MovieItem;