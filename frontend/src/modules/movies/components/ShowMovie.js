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
import MovieReviews from './ShowMovieComponents/MovieReviews';
import MovieHeader from "./ShowMovieComponents/MovieHeader";
import MoviePoster from "./ShowMovieComponents/MoviePoster";
import MovieInfo from "./ShowMovieComponents/MovieInfo";
import MovieRatingModal from "./ShowMovieComponents/MovieRatingModal";
import ConfirmationModal from "./ShowMovieComponents/ConfirmationModal";
import LoadingState from "./ShowMovieComponents/LoadingState";
import ErrorState from "./ShowMovieComponents/ErrorState";
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
    return <ErrorState error={error} theme={theme} onBackClick={handleBackClick} />;
  }

  // Renderizar estado de carga
  if (loading) {
    return <LoadingState theme={theme} />;
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
        <MovieHeader theme={theme} onBackClick={handleBackClick} />
        
        <div className="movie-detail-content">
          {/* Póster y botones de acción */}
          <MoviePoster 
            movie={movie}
            theme={theme}
            userRating={userRating}
            userId={userId}
            onAddToListClick={handleAddToListClick}
            onRateClick={handleRateClick}
            onEditRatingClick={handleRateClick}
            onDeleteRatingClick={handleDeleteRating}
          />
          
          {/* Información principal */}
          <MovieInfo 
            movie={movie}
            theme={theme}
            averageRating={averageRating}
            loadingRating={loadingRating}
            navigate={navigate}
          />
        </div>
        
        <div className="movie-section reviews-section">
          <MovieReviews movieId={movie.imdbId} authenticatedUser={authenticatedUser} />
        </div>
      </div>
      
      {/* Modal para añadir a lista */}
      {showAddToListModal && (
        <AddToListModal
          movie={movie}
          onClose={() => setShowAddToListModal(false)}
          authenticatedUser={authenticatedUser}
        />
      )}
      
      {/* Modal para valorar película */}
      {showRatingForm && (
        <MovieRatingModal
          theme={theme}
          userRating={userRating}
          ratingValue={ratingValue}
          ratingErrors={ratingErrors}
          ratingSuccess={ratingSuccess}
          onClose={() => setShowRatingForm(false)}
          onSubmit={handleRatingSubmit}
          onChange={handleRatingInputChange}
          onErrorClose={() => setRatingErrors(null)}
        />
      )}
      
      {/* Modal de confirmación para eliminar valoración */}
      {showDeleteConfirmation && (
        <ConfirmationModal
          theme={theme}
          title="¿Eliminar valoración?"
          message={`¿Estás seguro de que quieres eliminar tu valoración para "${movie.title}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar" 
          onConfirm={confirmDeleteRating}
          onCancel={() => setShowDeleteConfirmation(false)}
          isDanger={true}
        />
      )}
    </div>
  );
};

export default ShowMovie;