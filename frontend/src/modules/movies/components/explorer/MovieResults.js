import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import MovieCarousel from './MovieCarousel';
import MovieGrid from './MovieGrid';
import './MovieResults.css';

const MovieResults = ({ 
  movieSource, 
  externalMovies, 
  topRatedMovies,
  filters, 
  loadingExternal, 
  loadingMoreExternal, 
  loadingTopRated, 
  hasMore, 
  onLoadMore,
  onRetry,
  theme 
}) => {
  const navigate = useNavigate();

  const handleMovieClick = (imdbId) => {
    navigate(`/movies/${imdbId}`);
  };

  const renderTitle = () => {
    if (movieSource === 'external') {
      return filters.keyword ? `Resultados para "${filters.keyword}"` : 'Películas más populares';
    } else {
      return 'Películas mejor valoradas por usuarios';
    }
  };

  const renderContent = () => {
    // Show loading indicator
    if ((movieSource === 'external' && loadingExternal) || 
        (movieSource === 'topRated' && loadingTopRated)) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando películas...</p>
        </div>
      );
    }

    // Show external movies
    if (movieSource === 'external' && externalMovies.length > 0) {
      return (
        <>
          <MovieCarousel 
            movies={externalMovies} 
            onMovieClick={handleMovieClick} 
            theme={theme} 
          />
          
          {hasMore && (
            <div className="load-more-container">
              <button 
                className={`load-more-button ${theme}`} 
                onClick={onLoadMore}
                disabled={loadingMoreExternal}
              >
                {loadingMoreExternal ? (
                  <>
                    <span className="load-spinner"></span>
                    <span>Cargando más...</span>
                  </>
                ) : 'Cargar más películas'}
              </button>
            </div>
          )}
        </>
      );
    }

    // Show top rated movies
    if (movieSource === 'topRated' && topRatedMovies.length > 0) {
      console.log("Rendering top rated movies:", topRatedMovies); // Para depuración
      return (
        <MovieGrid 
          movies={topRatedMovies} 
          onMovieClick={handleMovieClick} 
          theme={theme} 
          source="topRated"
        />
      );
    }

    // Show no results message
    return (
      <div className="no-movies-container">
        <div className="no-movies-icon">🎬</div>
        <p className="no-movies-message">No se encontraron películas.</p>
        <button 
          className={`retry-button ${theme}`}
          onClick={onRetry}
        >
          Reintentar
        </button>
      </div>
    );
  };

  return (
    <section className="movies-section">
      <h2 className="section-title">{renderTitle()}</h2>
      {renderContent()}
    </section>
  );
};

MovieResults.propTypes = {
  movieSource: PropTypes.string.isRequired,
  externalMovies: PropTypes.array.isRequired,
  topRatedMovies: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  loadingExternal: PropTypes.bool.isRequired,
  loadingMoreExternal: PropTypes.bool.isRequired,
  loadingTopRated: PropTypes.bool.isRequired,
  hasMore: PropTypes.bool.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired
};

export default MovieResults;