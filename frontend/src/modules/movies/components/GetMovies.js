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

  const fetchMovies = (currentCursor) => {
    if (currentCursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    getExternalMovies(
      currentCursor,
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
      fetchMovies(cursor);
    }
  };

  // Filtramos películas sin imagen
  const filteredMovies = movies.filter(movie => 
    movie.imageSet?.verticalPoster?.w240
  );

  return (
    <div className={`movies-page ${theme}`}>
      <div className="movies-container">
        <header className="movies-header">
          <h1>Explorar Películas</h1>
          <p className="movies-description">
            Descubre las películas más populares del momento y añádelas a tus listas
          </p>
        </header>
        
        {errors && (
          <div className="error-container">
            <p className="error-message">
              {typeof errors === 'string' ? errors : errors.message || 'Ha ocurrido un error al cargar las películas'}
            </p>
          </div>
        )}

        <section className="movies-section">
          <h2 className="section-title">Películas más populares</h2>
          
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
                onClick={() => fetchMovies(null)}
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