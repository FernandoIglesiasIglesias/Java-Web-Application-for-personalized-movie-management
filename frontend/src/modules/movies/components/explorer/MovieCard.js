import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAverageRatingForMovie } from '../../../../backend/rateService';
import './MovieCard.css';

const MovieCard = ({ movie, onClick, theme, source }) => {
  const [imageError, setImageError] = useState(false);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    if (source === 'topRated' && movie.imdbId) {
      getAverageRatingForMovie(
        movie.imdbId,
        (rating) => setAverageRating(rating),
        () => setAverageRating(null) // Manejar errores silenciosamente
      );
    }
  }, [source, movie.imdbId]);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatRating = (rating) => {
    if (rating === null || rating === undefined || rating === 0) return 'N/A';
    const numRating = parseFloat(rating);
    return isNaN(numRating) ? 'N/A' : numRating.toFixed(1);
  };

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
          <div className="overlay-top">
            <div className="movie-year">{movie.year || '???'}</div>
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
        <div className="movie-ratings">
          {source === 'topRated' && averageRating !== null && (
            <div className="movie-rating users" title="Valoración media de usuarios">
              <span className="rating-icon">👤</span>
              <span className="rating-value">{formatRating(averageRating)}</span>
              <span className="rating-label">Usuarios</span>
            </div>
          )}
          {movie.rating && (
            <div className="movie-rating imdb" title="Valoración IMDB">
              <span className="rating-value">{formatRating(movie.rating)}</span>
              <span className="rating-label">IMDB</span>
            </div>
          )}
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