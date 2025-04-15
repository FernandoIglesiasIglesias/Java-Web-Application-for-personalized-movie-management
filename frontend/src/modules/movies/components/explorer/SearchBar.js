import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SearchBar.css';

const SearchBar = ({ initialValue = '', onSearch, onClear, isSearching, theme }) => {
  const [searchText, setSearchText] = useState(initialValue);
  
  const handleSearch = () => {
    if (searchText.trim()) {
      onSearch(searchText);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      handleSearch();
    }
  };
  
  const handleClearSearch = () => {
    setSearchText('');
    onClear();
  };

  return (
    <div className="search-wrapper">
      <div className={`search-container ${theme}`}>
        <input
          type="text"
          placeholder="Buscar películas por título..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={`search-input ${theme}`}
          onKeyPress={handleKeyPress}
          aria-label="Buscar películas"
        />
        <div className="search-buttons">
          <button
            onClick={handleSearch}
            className={`search-button ${theme}`}
            disabled={!searchText.trim()}
            aria-label="Buscar"
          >
            <span className="button-text">Buscar</span>
          </button>
          {isSearching && (
            <button
              onClick={handleClearSearch}
              className={`clear-search-button ${theme}`}
              aria-label="Limpiar búsqueda"
            >
              <span className="button-text">Limpiar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  initialValue: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isSearching: PropTypes.bool,
  theme: PropTypes.string.isRequired
};

export default SearchBar;