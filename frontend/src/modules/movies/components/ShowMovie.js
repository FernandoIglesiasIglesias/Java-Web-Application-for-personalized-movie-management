import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { saveMovie } from "../../../backend/movieService";
import { 
  rateMovie, 
  getUserRatingForMovie,
  getAverageRatingForMovie,
  deleteRating
} from "../../../backend/rateService";
import AddToListModal from "../../list/components/AddToListModal";
import { Errors } from "../../common";
import MovieReviews from './MovieReviews';
import "./ShowMovie.css";

const ShowMovie = ({ authenticatedUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [ratingValue, setRatingValue] = useState("");
  const [userRating, setUserRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingErrors, setRatingErrors] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Obtener el ID de usuario de forma segura desde las props
  const userId = authenticatedUser ? authenticatedUser.user.id : null;

  const parseMovieJson = (json) => {
    // Ensure strings are always properly set
    const ensureString = (value) => {
      if (value === null || value === undefined) return '';
      return String(value);
    };
    
    // Helper function to create a valid name from a string or object
    const createValidName = (person) => {
      // If person is null or undefined, return empty string
      if (person === null || person === undefined) return '';
      
      // If person is a string, return it directly
      if (typeof person === 'string') return ensureString(person);
      
      // If person is an object, check for name field first, then firstName/lastName
      if (typeof person === 'object') {
        // If name exists, return it
        if (person.name) return ensureString(person.name);
        
        // Try to construct from firstName/lastName if they exist
        if (person.firstName || person.lastName) {
          return ensureString((person.firstName || '') + ' ' + (person.lastName || '')).trim();
        }
      }
      
      // Fallback to empty string if all else fails
      return '';
    };
    
    return {
      imdbId: json.imdbId || '',
      title: json.title || '',
      overview: json.overview || '',
      releaseYear: json.releaseYear || null,
      verticalPoster: json.imageSet?.verticalPoster?.w720 || null,
      runtime: json.runtime || null,
      imdbRating: json.imdbRating || null,
      genres: (json.genres || []).map(genre => ({
        name: ensureString(genre.name)
      })),
      cast: (json.cast || []).map(actor => ({
        name: createValidName(actor),
        imdbId: typeof actor === 'object' ? (actor.imdbId || null) : null
      })),
      directors: (json.directors || []).map(director => ({
        name: createValidName(director),
        imdbId: typeof director === 'object' ? (director.imdbId || null) : null
      })),
      streamingOptions: json.streamingOptions || {}
    };
  };

  const loadUserRating = (movieImdbId) => {
    // Solo cargar valoración si hay un usuario autenticado
    if (!userId) return;
    
    getUserRatingForMovie(
      userId,
      movieImdbId,
      (data) => {
        if (data && data.rating !== undefined) {
          // Guardar también el ID de la valoración para poder eliminarla
          setUserRating({
            rating: data.rating,
            id: data.id
          });
          setRatingValue(data.rating.toString());
        }
      },
      (error) => {
        console.log("Usuario no ha valorado esta película");
      }
    );
  };

  const loadAverageRating = (movieImdbId) => {
    setLoadingRating(true);
    getAverageRatingForMovie(
      movieImdbId,
      (rating) => {
        setAverageRating(rating);
        setLoadingRating(false);
      },
      (error) => {
        console.log("No hay valoraciones para esta película");
        setLoadingRating(false);
      }
    );
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
          (savedMovie) => {
            console.log("Película guardada correctamente", savedMovie);
            // Obtener la valoración media una vez que tengamos el imdbId
            if (savedMovie && savedMovie.imdbId) {
              loadAverageRating(savedMovie.imdbId);
              // Solo cargar la valoración del usuario si hay un usuario autenticado
              if (userId) {
                loadUserRating(savedMovie.imdbId);
              }
            }
          }, 
          (error) => console.error("Error guardando película", error)
        );
      })
      .catch((error) => {
        console.error("Error al cargar detalles de la película:", error);
        setError(error);
        setLoading(false);
      });
  }, [id, userId]); // Incluir userId en las dependencias

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleRatingInputChange = (e) => {
    const value = e.target.value;
    
    // Permitir solo números y un punto decimal
    if (value === "" || /^(\d+)?(\.\d{0,1})?$/.test(value)) {
      setRatingValue(value);
    }
  };

  // Función para manejar el clic en "Añadir a lista"
  const handleAddToListClick = () => {
    // Verificar si el usuario está autenticado
    if (!authenticatedUser) {
      // Redirigir a la página de login
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    // Si está autenticado, mostrar el modal
    setShowAddToListModal(true);
  };

  // Función para manejar el clic en "Valorar película"
  const handleRateClick = () => {
    // Verificar si el usuario está autenticado
    if (!authenticatedUser) {
      // Redirigir a la página de login
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    // Si está autenticado, mostrar el formulario de valoración
    setShowRatingForm(true);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    setRatingErrors(null);
    
    // Verificar que el usuario está autenticado
    if (!userId) {
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    let valueFloat = parseFloat(ratingValue);
    
    // Validaciones básicas
    if (ratingValue === "" || isNaN(valueFloat)) {
      setRatingErrors({ globalError: "Debes introducir un valor numérico." });
      return;
    }
    
    if (valueFloat < 0 || valueFloat > 10) {
      setRatingErrors({ globalError: "La valoración debe estar entre 0 y 10." });
      return;
    }
    
    // Verificar que movie existe y tiene imdbId
    if (!movie || !movie.imdbId) {
      setRatingErrors({ globalError: "No se puede valorar la película. Información de película no disponible." });
      return;
    }
    
    // Enviar valoración usando el imdbId
    rateMovie(
      userId,
      movie.imdbId,
      valueFloat,
      (data) => {
        // Guardar la valoración y su ID
        setUserRating({
          rating: data.rating,
          id: data.id
        });
        setRatingSuccess(true);
        setTimeout(() => setRatingSuccess(false), 3000);
        
        // Actualizar la valoración media
        loadAverageRating(movie.imdbId);
        setShowRatingForm(false);
      },
      (errors) => {
        setRatingErrors(errors);
      }
    );
  };

  // Modificar handleDeleteRating para verificar autenticación
  const handleDeleteRating = () => {
    // Verificar que el usuario está autenticado
    if (!userId) {
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    // Verificar que movie existe y tiene imdbId
    if (!movie || !movie.imdbId) {
      setRatingErrors({ globalError: "No se puede eliminar la valoración. Información de película no disponible." });
      return;
    }
    
    // Mostrar el diálogo de confirmación en lugar de window.confirm
    setShowDeleteConfirmation(true);
  };

  // Función para confirmar la eliminación de la valoración
  const confirmDeleteRating = () => {
    // Verificar nuevamente que el usuario está autenticado
    if (!userId) {
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    deleteRating(
      userId,
      movie.imdbId,
      () => {
        setUserRating(null);
        setRatingValue("");
        setShowDeleteConfirmation(false);
        
        // Mostrar mensaje de éxito
        setRatingSuccess(true);
        setTimeout(() => {
          setRatingSuccess(false);
        }, 3000);
        
        // Actualizar la valoración media
        loadAverageRating(movie.imdbId);
      },
      (errors) => {
        setRatingErrors(errors);
        setShowDeleteConfirmation(false);
      }
    );
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
              onClick={handleAddToListClick}
            >
              <span className="button-icon">+</span>
              <span>Añadir a lista</span>
            </button>

            {/* Sección de valoración del usuario */}
            <div className="rating-user-section">
              {userId && userRating !== null ? (
                <div className="user-has-rated">
                  <p className="your-rating-label">Tu valoración:</p>
                  <div className="your-rating-value">
                    {typeof userRating === 'object' ? userRating.rating : userRating} 
                    <span className="star">★</span>
                  </div>
                  <div className="rating-actions">
                    <button 
                      className={`rating-action-button ${theme}`} 
                      onClick={handleRateClick}
                    >
                      Editar
                    </button>
                    <button 
                      className={`rating-action-button delete ${theme}`} 
                      onClick={handleDeleteRating}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={`rate-movie-button ${theme}`}
                  onClick={handleRateClick}
                >
                  <span className="button-icon">★</span>
                  <span>Valorar película</span>
                </button>
              )}
            </div>
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
                    <span className="rating-value">IMDB: {movie.imdbRating.toFixed(1)}</span>
                  </span>
                )}
                
                {/* Bloque añadido: Valoraciones de usuarios */}
                <div className="user-rating-container">
                  {loadingRating ? (
                    <div className="rating-loading">
                      <div className="mini-spinner"></div>
                    </div>
                  ) : (
                    <>
                      {averageRating ? (
                        <span className="movie-user-rating">
                          <span className="user-star-icon">★</span> 
                          <span className="user-rating-value">Usuarios: {averageRating.toFixed(1)}</span>
                        </span>
                      ) : (
                        <span className="movie-no-rating">
                          <span className="no-rating-icon">☆</span>
                          <span className="no-rating-text">Sin valoraciones</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
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
                        <span 
                          key={index} 
                          className="director-member clickable"
                          onClick={() => navigate(`/directors/${encodeURIComponent(director.name)}`)}
                        >
                          {director.name}
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
                        <span 
                          key={index} 
                          className="cast-member clickable"
                          onClick={() => navigate(`/actors/${encodeURIComponent(actor.name)}`)}
                        >
                          {actor.name}
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
        <div className="movie-section reviews-section">
          <MovieReviews movieId={movie.imdbId} authenticatedUser={authenticatedUser} />
        </div>
      </div>
      
      {/* Modal para añadir a lista - Pasa el authenticatedUser */}
      {showAddToListModal && (
        <AddToListModal
          movie={movie}
          onClose={() => setShowAddToListModal(false)}
          authenticatedUser={authenticatedUser}
        />
      )}
      
      {/* Formulario para valorar película */}
      {showRatingForm && (
        <div className="modal-overlay">
          <div className={`rating-modal ${theme}`}>
            <div className="rating-modal-header">
              <h3>{userRating ? 'Editar valoración' : 'Valorar película'}</h3>
              <button 
                className="close-modal-button" 
                onClick={() => setShowRatingForm(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            {ratingErrors && <Errors errors={ratingErrors} onClose={() => setRatingErrors(null)} />}
            
            {ratingSuccess && (
              <div className="rating-success-message">
                {userRating ? '¡Valoración actualizada con éxito!' : '¡Valoración guardada con éxito!'}
              </div>
            )}
            
            <form onSubmit={handleRatingSubmit} className="rating-form">
              <div className="rating-stars-container">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                  <span 
                    key={star} 
                    className={`rating-star ${parseFloat(ratingValue) >= star ? 'active' : ''}`}
                    onClick={() => setRatingValue(star.toString())}
                  >
                    ★
                  </span>
                ))}
              </div>
              
              <div className="rating-input-container">
                <div className="rating-input-group">
                  <input
                    type="text"
                    value={ratingValue}
                    onChange={handleRatingInputChange}
                    className={`rating-input ${theme}`}
                    placeholder="0-10"
                    maxLength="4"
                    autoFocus
                  />
                  <span className="rating-range">/ 10</span>
                </div>
                <p className="rating-help-text">
                  Introduce un valor entre 0 y 10 (se permite un decimal)
                </p>
              </div>
              
              <div className="rating-modal-actions">
                <button 
                  type="submit" 
                  className={`modal-button primary ${theme}`}
                  disabled={ratingValue === ""}
                >
                  {userRating ? 'Actualizar valoración' : 'Guardar valoración'}
                </button>
                <button 
                  type="button" 
                  className={`modal-button secondary ${theme}`}
                  onClick={() => setShowRatingForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Diálogo de confirmación para eliminar valoración */}
      {showDeleteConfirmation && (
        <div className="modal-overlay">
          <div className={`confirmation-modal ${theme}`}>
            <div className="confirmation-modal-header">
              <h3>¿Eliminar valoración?</h3>
            </div>
            <div className="confirmation-modal-content">
              <p>
                ¿Estás seguro de que quieres eliminar tu valoración para "{movie.title}"? 
                <br />Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="confirmation-modal-actions">
              <button
                className={`modal-button danger ${theme}`}
                onClick={confirmDeleteRating}
              >
                Eliminar
              </button>
              <button
                className={`modal-button secondary ${theme}`}
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowMovie;