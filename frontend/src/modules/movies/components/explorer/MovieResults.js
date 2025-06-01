import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import MovieCarousel from './MovieCarousel';
import MovieGrid from './MovieGrid';
import LoadingSpinner from "../../../common/LoadingSpinner"
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
  searchTitle = "",
  isSearching // Añadir el estado de búsqueda
}) => {
  const navigate = useNavigate();

  const handleMovieClick = (imdbId) => {
    navigate(`/movies/${imdbId}`);
  };

  const renderContent = () => {
    // Mostrar indicador de carga si está buscando
    if (isSearching && loadingExternal) {
      return (
        <div className="loading-container">
          <LoadingSpinner /> {/* Mostrar el componente LoadingSpinner */}
        </div>
      );
    }

    // Mostrar resultados de búsqueda o películas externas
    if ((searchTitle || movieSource === 'external') && externalMovies.length > 0) {
      const normalizedMovies = externalMovies.map(movie => ({
        id: movie.id,
        imdbId: movie.imdbId || movie.ids?.imdb,
        title: movie.title,
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
        </>
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
      <h2 className="results-title">{searchTitle ? `Resultados para "${searchTitle}"` : 'Películas'}</h2>
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
  searchTitle: PropTypes.string,
  isSearching: PropTypes.bool // Añadir la nueva prop
};

export default MovieResults;