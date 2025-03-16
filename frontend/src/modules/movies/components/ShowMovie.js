import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { saveMovie } from "../../../backend/movieService";
import AddToListModal from "../../list/components/AddToListModal";
import "./ShowMovie.css";

const ShowMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  const parseMovieJson = (json) => {
    const parseName = (name) => {
      // Manejar caso de nombre indefinido
      if (!name) return { firstName: '', lastName: '' };
      
      const [firstName, ...lastNameParts] = name.split(" ");
      return {
        firstName,
        lastName: lastNameParts.join(" ")
      };
    };
  
    return {
      imbdId: json.imdbId,
      title: json.title,
      overview: json.overview,
      releaseYear: json.releaseYear,
      verticalPoster: json.imageSet?.verticalPoster?.w720,
      runtime: json.runtime,
      imdbRating: json.imdbRating,
      genres: json.genres?.map(genre => ({
        name: genre.name
      })) || [],
      cast: json.cast?.map(parseName) || [],
      directors: json.directors?.map(parseName) || [],
      streamingOptions: json.streamingInfo
    };
  };

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://streaming-availability.p.rapidapi.com/shows/${id}?series_granularity=episode&output_language=es`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
          "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en la API: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.message) {
          throw new Error(data.message);
        }
        
        const parsedData = parseMovieJson(data);
        setMovie(parsedData);
        setLoading(false);
        
        // Guardar película en base de datos local
        saveMovie(
          parsedData, 
          () => console.log("Película guardada correctamente en la base de datos"), 
          (error) => console.error("Error guardando película", error)
        );
      })
      .catch((error) => {
        console.error("Error al cargar detalles de la película:", error);
        setError(error);
        setLoading(false);
      });
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  // Renderizar estado de error
  if (error) {
    return (
      <div className={`movie-error-container ${theme}`}>
        <div className="movie-error-content">
          <div className="movie-error-icon">❌</div>
          <h2>Ha ocurrido un error</h2>
          <p>{error.message || "No se pudo cargar la información de la película"}</p>
          <button 
            className={`movie-button primary ${theme}`}
            onClick={handleBackClick}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className={`movie-loading-container ${theme}`}>
        <div className="loading-spinner movie-spinner"></div>
        <p className="loading-text">Cargando detalles de la película...</p>
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      {/* Fondo con imagen de poster desenfocada para dar profundidad */}
      {movie.verticalPoster && (
        <div 
          className="movie-backdrop" 
          style={{ backgroundImage: `url(${movie.verticalPoster})` }}
        >
          <div className={`backdrop-overlay ${theme}`}></div>
        </div>
      )}
      
      <div className={`movie-detail-container ${theme}`}>
        {/* Cabecera con botón para volver atrás */}
        <div className="movie-detail-nav">
          <button 
            className={`back-button ${theme}`}
            onClick={handleBackClick}
            aria-label="Volver atrás"
          >
            ← Volver
          </button>
        </div>
        
        <div className="movie-detail-content">
          {/* Póster de la película */}
          <div className="movie-details-poster-container">
            {movie.verticalPoster ? (
              <img
                src={movie.verticalPoster}
                alt={movie.title || "Póster de la película"}
                className="movie-poster-image"
              />
            ) : (
              <div className="movie-poster-placeholder">
                <span>No disponible</span>
              </div>
            )}
            
            {/* Botón para añadir a lista */}
            <button
              className={`add-to-list-button ${theme}`}
              onClick={() => setShowAddToListModal(true)}
            >
              <span className="button-icon">+</span>
              <span>Añadir a lista</span>
            </button>
          </div>
          
          {/* Información principal */}
          <div className="movie-info-container">
            <div className="movie-header-info">
              <h1 className="movie-title">{movie.title || "Título no disponible"}</h1>
              
              <div className="movie-meta">
                {movie.releaseYear && <span className="movie-year">{movie.releaseYear}</span>}
                {movie.runtime && <span className="movie-runtime">{movie.runtime} min</span>}
                {movie.imdbRating && (
                  <span className="movie-rating">
                    <span className="star-icon">★</span> 
                    {movie.imdbRating.toFixed(1)}
                  </span>
                )}
              </div>
              
              {movie.genres && movie.genres.length > 0 && (
                <div className="movie-genres">
                  {movie.genres.map((genre, index) => (
                    <span key={index} className="genre-tag">{genre.name}</span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="movie-section">
              <h2>Sinopsis</h2>
              <p className="movie-overview">{movie.overview || "No hay sinopsis disponible para esta película."}</p>
            </div>
            
            <div className="movie-section">
              <h2>Detalles</h2>
              <div className="movie-details-grid">
                {movie.directors && movie.directors.length > 0 && (
                  <div className="detail-item">
                    <h3>Dirección</h3>
                    <p className="directors-list">
                      {movie.directors.map((director, index) => (
                        <span key={index} className="director-member">
                          {`${director.firstName} ${director.lastName}`.trim()}
                        </span>
                      ))}
                      {movie.directors.length > 6 && 
                        <span className="director-more">+{movie.directors.length - 6} más</span>
                      }
                    </p>
                  </div>
                )}
                
                {movie.cast && movie.cast.length > 0 && (
                  <div className="detail-item">
                    <h3>Reparto principal</h3>
                    <p className="cast-list">
                      {movie.cast.slice(0, 6).map((actor, index) => (
                        <span key={index} className="cast-member">
                          {`${actor.firstName} ${actor.lastName}`.trim()}
                        </span>
                      ))}
                      {movie.cast.length > 6 && <span className="cast-more">+{movie.cast.length - 6} más</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Opciones de streaming */}
            <div className="movie-section streaming-section">
              <h2>Dónde ver</h2>
              {movie.streamingOptions?.es && movie.streamingOptions.es.length > 0 ? (
                <div className="streaming-platforms">
                  {movie.streamingOptions.es.map((option) => (
                    <a
                      key={option.service.id}
                      href={option.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`platform-item ${theme}`}
                      title={`Ver en ${option.service.name}`}
                    >
                      <img
                        src={theme === 'dark' && option.service.imageSet?.darkThemeImage 
                          ? option.service.imageSet.darkThemeImage 
                          : option.service.imageSet?.lightThemeImage}
                        alt={option.service.name}
                        className="platform-logo"
                      />
                      <span className="platform-name">{option.service.name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="no-streaming">No disponible actualmente en plataformas de streaming.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal para añadir a lista */}
      {showAddToListModal && (
        <AddToListModal
          movie={movie}
          onClose={() => setShowAddToListModal(false)}
        />
      )}
    </div>
  );
};

export default ShowMovie;