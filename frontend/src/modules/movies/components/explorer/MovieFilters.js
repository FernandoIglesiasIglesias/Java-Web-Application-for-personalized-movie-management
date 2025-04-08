import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './MovieFilters.css';

const MovieFilters = ({ filters, availableGenres, orderOptions, languageOptions, onSubmit, theme }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const isChecked = e.target.checked;
      
      if (name === "genres") {
        const genreId = e.target.value;
        let newGenres = [...localFilters.genres];
        
        if (isChecked) {
          newGenres.push(genreId);
        } else {
          newGenres = newGenres.filter(id => id !== genreId);
        }
        
        setLocalFilters({
          ...localFilters,
          genres: newGenres
        });
      }
    } else {
      setLocalFilters({
        ...localFilters,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(localFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      keyword: "",
      showType: "movie",
      yearMin: "",
      yearMax: "",
      ratingMin: "",
      ratingMax: "",
      genres: [],
      orderBy: "popularity_1month",
      orderDirection: "desc",
      showOriginalLanguage: "",
      genresRelation: "or"
    };
    
    setLocalFilters(defaultFilters);
  };

  return (
    <div className={`filters-container ${theme} visible`}>
      <form onSubmit={handleSubmit} className="filters-form">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="keyword">
              <span className="keyword-icon"></span> Buscar por palabra clave:
            </label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              value={localFilters.keyword}
              onChange={handleFilterChange}
              placeholder="Título, actor, director, descripción..."
              className={`filter-input ${theme}`}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="yearMin">Año mínimo:</label>
            <input
              type="number"
              id="yearMin"
              name="yearMin"
              value={localFilters.yearMin}
              onChange={handleFilterChange}
              placeholder="Ej: 2000"
              className={`filter-input ${theme}`}
              min="1900"
              max="2023"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="yearMax">Año máximo:</label>
            <input
              type="number"
              id="yearMax"
              name="yearMax"
              value={localFilters.yearMax}
              onChange={handleFilterChange}
              placeholder="Ej: 2023"
              className={`filter-input ${theme}`}
              min="1900"
              max="2023"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="ratingMin">Valoración mínima:</label>
            <input
              type="number"
              id="ratingMin"
              name="ratingMin"
              value={localFilters.ratingMin}
              onChange={handleFilterChange}
              placeholder="0 - 100"
              className={`filter-input ${theme}`}
              min="0"
              max="100"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="ratingMax">Valoración máxima:</label>
            <input
              type="number"
              id="ratingMax"
              name="ratingMax"
              value={localFilters.ratingMax}
              onChange={handleFilterChange}
              placeholder="0 - 100"
              className={`filter-input ${theme}`}
              min="0"
              max="100"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="orderBy">Ordenar por:</label>
            <select
              id="orderBy"
              name="orderBy"
              value={localFilters.orderBy}
              onChange={handleFilterChange}
              className={`filter-select ${theme}`}
            >
              {orderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="orderDirection">Dirección:</label>
            <select
              id="orderDirection"
              name="orderDirection"
              value={localFilters.orderDirection}
              onChange={handleFilterChange}
              className={`filter-select ${theme}`}
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="showOriginalLanguage">Idioma original:</label>
            <select
              id="showOriginalLanguage"
              name="showOriginalLanguage"
              value={localFilters.showOriginalLanguage}
              onChange={handleFilterChange}
              className={`filter-select ${theme}`}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="genres-container">
          <h4>Géneros:</h4>
          <div className="genres-grid">
            {availableGenres.map((genre) => (
              <div key={genre.id} className="genre-checkbox">
                <input
                  type="checkbox"
                  id={`genre-${genre.id}`}
                  name="genres"
                  value={genre.id}
                  checked={localFilters.genres.includes(genre.id)}
                  onChange={handleFilterChange}
                />
                <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="filter-actions">
          <button 
            type="button" 
            onClick={resetFilters}
            className={`reset-button ${theme}`}
          >
            Restablecer
          </button>
          <button 
            type="submit" 
            className={`apply-button ${theme}`}
          >
            Aplicar filtros
          </button>
        </div>
      </form>
    </div>
  );
};

MovieFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  availableGenres: PropTypes.array.isRequired,
  orderOptions: PropTypes.array.isRequired,
  languageOptions: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired
};

export default MovieFilters;