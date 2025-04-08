import React from 'react';
import PropTypes from 'prop-types';
import './MovieHeader.css';

const MovieHeader = ({ showFilters, setShowFilters, movieSource, onSourceChange, theme }) => {
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
            className={`source-button ${theme} ${movieSource === "external" ? "active" : ""}`}
          >
            <span className="source-icon">🌎</span>
            Catálogo General
          </button>
          <button 
            onClick={() => onSourceChange("topRated")}
            className={`source-button ${theme} ${movieSource === "topRated" ? "active" : ""}`}
          >
            <span className="source-icon">⭐</span>
            Valoradas por Usuarios
          </button>
        </div>
        <button 
          className={`toggle-filters-button ${theme} ${showFilters ? 'active' : ''}`}
          onClick={toggleFilters}
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          <span className="filter-icon">🔍</span>
        </button>
        <p className="movies-description">
          {movieSource === 'external' 
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
  theme: PropTypes.string.isRequired
};

export default MovieHeader;