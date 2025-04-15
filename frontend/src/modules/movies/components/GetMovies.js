import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getExternalMovies } from "../../../backend/movieService";
import { useTheme } from "../../../context/ThemeContext";
import "./GetMovies.css";

const GetMovies = () => {
  const [movies, setMovies] = useState([]);
  const [errors, setErrors] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();
  const moviesListRef = useRef(null);
  const { theme } = useTheme();

  // Filter states
  const [filters, setFilters] = useState({
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
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Available genres from API
  const availableGenres = [
    { id: "1", name: "Acción" },
    { id: "2", name: "Aventura" },
    { id: "3", name: "Animación" },
    { id: "4", name: "Comedia" },
    { id: "5", name: "Crimen" },
    { id: "6", name: "Documental" },
    { id: "7", name: "Drama" },
    { id: "8", name: "Familiar" },
    { id: "9", name: "Fantasía" },
    { id: "10", name: "Historia" },
    { id: "11", name: "Terror" },
    { id: "12", name: "Música" },
    { id: "13", name: "Misterio" },
    { id: "14", name: "Romance" },
    { id: "15", name: "Ciencia Ficción" },
    { id: "16", name: "Thriller" },
    { id: "17", name: "Bélica" },
    { id: "18", name: "Western" }
  ];
  
  
  const orderOptions = [
    { value: "original_title", label: "Título" },
    { value: "popularity_1month", label: "Popularidad (1 mes)" },
    { value: "popularity_1week", label: "Popularidad (1 semana)" },
    { value: "year", label: "Año" },
    { value: "rating", label: "Valoración" },
  ];
  
  const languageOptions = [
    { value: "", label: "Todos" },
    { value: "es", label: "Español" },
    { value: "en", label: "Inglés" },
    { value: "fr", label: "Francés" },
    { value: "de", label: "Alemán" },
    { value: "it", label: "Italiano" },
    { value: "ja", label: "Japonés" },
    { value: "ko", label: "Coreano" },
    { value: "zh", label: "Chino" },
  ];

  const fetchMovies = (currentCursor, appliedFilters = filters) => {
    if (currentCursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    getExternalMovies(
      currentCursor,
      appliedFilters,
      (data) => {
        if (data?.shows) {
          setMovies((prevMovies) => 
            currentCursor ? [...prevMovies, ...data.shows] : data.shows
          );
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        } else {
          setErrors("No se encontraron resultados.");
        }
        setLoading(false);
        setLoadingMore(false);
      },
      (errors) => {
        setErrors(errors);
        setLoading(false);
        setLoadingMore(false);
      }
    );
  };

  useEffect(() => {
    fetchMovies(null);
    
    return () => {
      // Cleanup function
      setMovies([]);
      setErrors(null);
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const isChecked = e.target.checked;
      
      if (name === "genres") {
        const genreId = e.target.value;
        let newGenres = [...filters.genres];
        
        if (isChecked) {
          newGenres.push(genreId);
        } else {
          newGenres = newGenres.filter(id => id !== genreId);
        }
        
        setFilters({
          ...filters,
          genres: newGenres
        });
      }
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCursor(null);
    setMovies([]);
    fetchMovies(null, filters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
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
    });
  };

  const scrollMovies = (direction) => {
    if (moviesListRef.current) {
      const containerWidth = moviesListRef.current.clientWidth;
      const scrollAmount = containerWidth * 0.8; // Desplazamiento del 80% del contenedor
      
      moviesListRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMovieClick = (imdbId) => {
    navigate(`/movies/${imdbId}`);
  };

  const handleLoadMore = () => {
    if (hasMore && cursor && !loadingMore) {
      fetchMovies(cursor, filters);
    }
  };

  // Filtramos películas sin imagen
  const filteredMovies = movies.filter(movie => 
    movie.imageSet?.verticalPoster?.w240
  );

  const toggleFilters = () => {
    setShowFilters(prevState => !prevState);
  };

  return (
    <div className={`movies-page ${theme}`}>
      <div className="movies-container">
        <header className="movies-header">
          <h1>Explorar Películas</h1>
          <div className="search-controls">
            <button 
              className={`toggle-filters-button ${theme} ${showFilters ? 'active' : ''}`}
              onClick={toggleFilters}
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              <span className="filter-icon">🔍</span>
            </button>
            <p className="movies-description">
              Descubre las películas más populares del momento y añádelas a tus listas
            </p>
          </div>
        </header>
        
        {showFilters && (
          <div className={`filters-container ${theme} visible`}>
            {/* Contenido del formulario de filtros */}
            <form onSubmit={handleFilterSubmit} className="filters-form">
              <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="keyword">
                  <span className="keyword-icon"></span> Buscar por palabra clave:
                </label>
                <input
                  type="text"
                  id="keyword"
                  name="keyword"
                  value={filters.keyword}
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
                    value={filters.yearMin}
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
                    value={filters.yearMax}
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
                    value={filters.ratingMin}
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
                    value={filters.ratingMax}
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
                    value={filters.orderBy}
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
                    value={filters.orderDirection}
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
                    value={filters.showOriginalLanguage}
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
                        checked={filters.genres.includes(genre.id)}
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
        )}
        
        {errors && (
          <div className="error-container">
            <p className="error-message">
              {typeof errors === 'string' ? errors : errors.message || 'Ha ocurrido un error al cargar las películas'}
            </p>
          </div>
        )}

        <section className="movies-section">
          <h2 className="section-title">
            {filters.keyword ? 
              `Resultados para "${filters.keyword}"` : 
              'Películas más populares'
            }
          </h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Cargando películas...</p>
            </div>
          ) : filteredMovies.length > 0 ? (
            <>
              <div className="movies-carousel-container">
                <button
                  className={`carousel-button left ${theme}`}
                  onClick={() => scrollMovies("left")}
                  aria-label="Desplazar a la izquierda"
                >
                  <span className="arrow">&#9664;</span>
                </button>
                
                <div className="movies-list-container" ref={moviesListRef}>
                  <div className="movies-list">
                    {filteredMovies.map((movie) => (
                      <div
                        key={`${movie.id}`}
                        className={`movie-card ${theme}`}
                        onClick={() => handleMovieClick(movie.id)}
                      >
                        <div className="movie-poster-wrapper">
                          <img
                            src={movie.imageSet?.verticalPoster?.w240 || "https://via.placeholder.com/240x360?text=No+Image"}
                            alt={movie.title}
                            className="movie-poster"
                            loading="lazy"
                          />
                          <div className="movie-overlay">
                            <div className="movie-year">{movie.releaseYear || '???'}</div>
                            <div className="movie-rating">
                              {movie.imdbRating ? `★ ${movie.imdbRating.toFixed(1)}` : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="movie-info">
                          <h3 className="movie-title">{movie.title}</h3>
                          <p className="movie-genres">
                            {movie.genres?.slice(0, 2).map(g => g.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  className={`carousel-button right ${theme}`}
                  onClick={() => scrollMovies("right")}
                  aria-label="Desplazar a la derecha"
                >
                  <span className="arrow">&#9654;</span>
                </button>
              </div>
              
              {hasMore && (
                <div className="load-more-container">
                  <button 
                    className={`load-more-button ${theme}`} 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className="load-spinner"></span>
                        <span>Cargando más...</span>
                      </>
                    ) : 'Cargar más películas'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-movies-container">
              <div className="no-movies-icon">🎬</div>
              <p className="no-movies-message">No se encontraron películas.</p>
              <button 
                className={`retry-button ${theme}`}
                onClick={() => fetchMovies(null, filters)}
              >
                Reintentar
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GetMovies;