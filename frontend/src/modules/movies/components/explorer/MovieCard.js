import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './MovieCard.css';

const MovieCard = ({ movie, onClick, theme, source }) => {
  const [imageError, setImageError] = useState(false);
  
  // Depuración
  console.log("MovieCard rendering with data:", movie);

  const handleImageError = () => {
    console.log(`Error cargando imagen para película: ${movie.title}`, movie.posterUrl);
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

  // Obtener iniciales para placeholder
  const getInitials = () => {
    if (!movie.title) return "??";
    return movie.title
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
        {imageError ? (
          <div className="movie-placeholder">
            <div className="movie-initials">{getInitials()}</div>
          </div>
        ) : (
          <img
            src={movie.posterUrl || "https://via.placeholder.com/240x360?text=No+Image"}
            alt={movie.title}
            className="movie-poster"
            loading="lazy"
            onError={handleImageError}
          />
        )}
        <div className="movie-overlay">
          <div className="movie-year">{movie.year || '???'}</div>
          <div className="movie-ratings">
            {movie.rating && (
              <div className="movie-rating imdb" title="Valoración IMDB">
                <span className="rating-icon">⭐</span>
                <span className="rating-value">{formatRating(movie.rating)}</span>
              </div>
            )}
            {shouldShowUserRating && (
              <div className="movie-rating user" title="Valoración de usuarios">
                <span className="rating-icon">👤</span>
                <span className="rating-value">{formatRating(movie.userRating)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title || 'Sin título'}</h3>
        <div className="movie-genres">
          {(movie.genres || []).slice(0, 2).map((genre, index) => (
            <span key={index} className="movie-genre">{genre}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imdbId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
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