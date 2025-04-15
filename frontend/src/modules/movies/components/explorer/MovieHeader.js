import React from 'react';
import PropTypes from 'prop-types';
import './MovieHeader.css';

const MovieHeader = ({ 
  showFilters, 
  setShowFilters, 
  movieSource, 
  onSourceChange, 
  theme, 
  isSearching = false 
}) => {
  const toggleFilters = () => {
    setShowFilters(prevState => !prevState);
  };

  return (
    <header className={`movie-header ${theme}`}>
      <h1>Explorar Películas</h1>
      <div className="search-controls">
        <div className="source-toggle">
          <button 
            onClick={() => onSourceChange("external")}
            className={`source-button ${theme} ${movieSource === "external" && !isSearching ? "active" : ""}`}
            disabled={isSearching}
          >
            <span className="source-icon">🌎</span>
            Catálogo General
          </button>
          <button 
            onClick={() => onSourceChange("topRated")}
            className={`source-button ${theme} ${movieSource === "topRated" && !isSearching ? "active" : ""}`}
            disabled={isSearching}
          >
            <span className="source-icon">⭐</span>
            Valoradas por Usuarios
          </button>
        </div>
        
        {/* Solo mostrar el botón de filtros si no estamos en modo búsqueda */}
        {!isSearching && (
          <button 
            className={`toggle-filters-button ${theme} ${showFilters ? 'active' : ''}`}
            onClick={toggleFilters}
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            <span className="filter-icon">🔍</span>
          </button>
        )}
        
        <p className="movies-description">
          {isSearching
            ? 'Resultados de búsqueda por título'
            : movieSource === 'external' 
              ? 'Descubre las películas más populares del momento y añádelas a tus listas' 
              : '⭐ Películas mejor valoradas por nuestra comunidad de usuarios ⭐'}
        </p>
      </div>
    </header>
  );
};

MovieHeader.propTypes = {
  showFilters: PropTypes.bool.isRequired,
  setShowFilters: PropTypes.func.isRequired,
  movieSource: PropTypes.string.isRequired,
  onSourceChange: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  isSearching: PropTypes.bool
};

export default MovieHeader;