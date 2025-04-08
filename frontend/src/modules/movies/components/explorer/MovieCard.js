import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './MovieCard.css';

const MovieCard = ({ movie, onClick, theme, source }) => {
  const [imageError, setImageError] = useState(false);
  
  console.log("MovieCard rendering with data:", movie); // Para depuración

  const handleImageError = () => {
    setImageError(true);
  };

  // Formatear la valoración para mostrarla con un decimal
  const formatRating = (rating) => {
    if (rating === null || rating === undefined || rating === 0) return 'N/A';
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? 'N/A' : numRating.toFixed(1);
  };

  // Determinar si se debe mostrar una valoración
  const shouldShowUserRating = movie.userRating !== null && 
                              movie.userRating !== undefined && 
                              movie.userRating !== 0;

  return (
    <div
      className={`movie-card ${theme} ${source === 'topRated' ? 'top-rated' : ''}`}
      onClick={() => onClick(movie.imdbId || movie.id)}
    >
      <div className="movie-poster-wrapper">
        {source === 'topRated' && (
          <div className="top-rated-badge">
            <span>★ Top Rated</span>
          </div>
        )}
        <img
          src={imageError ? "https://via.placeholder.com/240x360?text=No+Image" : (movie.posterUrl || "https://via.placeholder.com/240x360?text=No+Image")}
          alt={movie.title}
          className={`movie-poster ${imageError ? 'error' : ''}`}
          loading="lazy"
          onError={handleImageError}
        />
        <div className="movie-overlay">
          <div className="movie-year">{movie.year || '???'}</div>
          <div className="movie-ratings">
            {movie.rating && (
              <div className="movie-rating imdb" title="Valoración IMDB">
                IMDB: {formatRating(movie.rating)}
              </div>
            )}
            {shouldShowUserRating && (
              <div className="movie-rating users" title="Valoración de usuarios">
                Users: {formatRating(movie.userRating)}
              </div>
            )}
            {!movie.rating && !shouldShowUserRating && (
              <div className="movie-rating">N/A</div>
            )}
          </div>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-genres">
          {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : ''}
        </p>
      </div>
    </div>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imdbId: PropTypes.string,
    title: PropTypes.string.isRequired,
    posterUrl: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    genres: PropTypes.array
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  source: PropTypes.string
};

MovieCard.defaultProps = {
  source: 'external'
};

export default MovieCard;