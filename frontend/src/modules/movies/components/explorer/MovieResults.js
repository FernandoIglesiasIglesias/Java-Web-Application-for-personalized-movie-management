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
  theme,
  searchTitle = "" 
}) => {
  const navigate = useNavigate();

  const handleMovieClick = (imdbId) => {
    navigate(`/movies/${imdbId}`);
  };

  const renderTitle = () => {
    if (searchTitle) {
      return `Resultados para "${searchTitle}"`;
    }
    
    if (movieSource === 'external') {
      return filters.keyword ? `Resultados para "${filters.keyword}"` : 'Películas más populares';
    } else {
      return 'Películas mejor valoradas por usuarios';
    }
  };

  const renderContent = () => {
    // Mostrar indicador de carga
    if ((movieSource === 'external' && loadingExternal) || 
        (movieSource === 'topRated' && loadingTopRated)) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando películas...</p>
        </div>
      );
    }

    // Mostrar resultados de búsqueda o películas externas
    if ((searchTitle || movieSource === 'external') && externalMovies.length > 0) {
      // Normalizar datos para asegurar que cada película tiene la estructura correcta
      const normalizedMovies = externalMovies.map(movie => ({
        id: movie.id,
        imdbId: movie.imdbId || movie.ids?.imdb,
        title: movie.title,
        // Manejar múltiples formatos de poster
        posterUrl: movie.posterUrl || 
                  movie.imageSet?.verticalPoster?.w240 || 
                  movie.posterURLs?.w342 || 
                  movie.posterURLs?.w500 || 
                  movie.verticalPoster,
        year: movie.releaseYear || movie.year,
        rating: movie.imdbRating || movie.rating,
        userRating: movie.averageRating,
        genres: (movie.genres || []).map(g => typeof g === 'string' ? g : g.name)
      }));

      return (
        <>
          {searchTitle ? (
            <MovieGrid 
              movies={normalizedMovies} 
              onMovieClick={handleMovieClick} 
              theme={theme} 
              source="search"
            />
          ) : (
            <MovieCarousel 
              movies={normalizedMovies} 
              onMovieClick={handleMovieClick} 
              theme={theme}
            />
          )}
          
          {/* Solo mostrar el botón de cargar más si no es una búsqueda */}
          {!searchTitle && hasMore && !loadingMoreExternal && (
            <div className="load-more-container">
              <button 
                className={`load-more-button ${theme}`}
                onClick={onLoadMore}
              >
                Cargar más películas
              </button>
            </div>
          )}
          
          {!searchTitle && loadingMoreExternal && (
            <div className="loading-more-container">
              <div className="loading-spinner small"></div>
              <p>Cargando más películas...</p>
            </div>
          )}
        </>
      );
    }
    
    // Mostrar películas mejor valoradas
    if (movieSource === 'topRated' && topRatedMovies.length > 0) {
      return (
        <MovieGrid 
          movies={topRatedMovies.map(movie => ({
            ...movie,
            // Asegurar que cada película tenga una URL de poster válida
            posterUrl: movie.posterUrl || movie.verticalPoster
          }))}
          onMovieClick={handleMovieClick}
          theme={theme}
          source="topRated"
        />
      );
    }
    
    // Mostrar mensaje de no resultados
    return (
      <div className="no-results-container">
        <p className="no-results-message">
          {searchTitle 
            ? `No se encontraron películas para "${searchTitle}"` 
            : movieSource === 'external' 
              ? 'No se encontraron películas con los filtros seleccionados'
              : 'No hay películas valoradas por usuarios aún'}
        </p>
        {onRetry && (
          <button 
            className={`retry-button ${theme}`} 
            onClick={onRetry}
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="movie-results-container">
      <h2 className="results-title">{renderTitle()}</h2>
      {renderContent()}
    </div>
  );
};

MovieResults.propTypes = {
  movieSource: PropTypes.string.isRequired,
  externalMovies: PropTypes.array.isRequired,
  topRatedMovies: PropTypes.array.isRequired,
  filters: PropTypes.object,
  loadingExternal: PropTypes.bool,
  loadingMoreExternal: PropTypes.bool,
  loadingTopRated: PropTypes.bool,
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
  onRetry: PropTypes.func,
  theme: PropTypes.string.isRequired,
  searchTitle: PropTypes.string
};

export default MovieResults;