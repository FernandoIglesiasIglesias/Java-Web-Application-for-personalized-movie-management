import React from "react";
import "./MoviePoster.css";

const MoviePoster = ({ 
  movie, 
  theme, 
  userRating, 
  userId,
  onAddToListClick, 
  onRateClick,
  onEditRatingClick,
  onDeleteRatingClick
}) => {
  return (
    <div className="movie-details-poster-container">
      {movie.verticalPoster ? (
        <img
          src={movie.verticalPoster}
          alt={movie.title || "Póster de la película"}
          className="movie-poster-image"
        />
      ) : (
        <div className={`movie-poster-placeholder ${theme}`}>
          <span>No disponible</span>
        </div>
      )}
      
      {/* Botón para añadir a lista */}
      <button
        className={`add-to-list-button ${theme}`}
        onClick={onAddToListClick}
      >
        <span className="button-icon">+</span>
        <span>Añadir a lista</span>
      </button>

      {/* Sección de valoración del usuario */}
      <div className="rating-user-section">
        {userId && userRating !== null ? (
          <div className={`user-has-rated ${theme}`}>
            <p className={`your-rating-label ${theme}`}>Tu valoración:</p>
            <div className={`your-rating-value ${theme}`}>
              {typeof userRating === 'object' ? userRating.rating : userRating} 
              <span className="star">★</span>
            </div>
            <div className="rating-actions">
              <button 
                className={`rating-action-button ${theme}`} 
                onClick={onEditRatingClick}
              >
                Editar
              </button>
              <button 
                className={`rating-action-button delete ${theme}`} 
                onClick={onDeleteRatingClick}
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <button
            className={`rate-movie-button ${theme}`}
            onClick={onRateClick}
          >
            <span className="button-icon">★</span>
            <span>Valorar película</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MoviePoster;