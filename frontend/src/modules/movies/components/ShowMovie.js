import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { saveMovie, getMovieCast } from "../../../backend/movieService";
import { 
  rateMovie, 
  getUserRatingForMovie,
  getAverageRatingForMovie,
  deleteRating
} from "../../../backend/rateService";
import AddToListModal from "../../list/components/modals/AddMovieToListModal";
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
  // Hooks y estado
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const userId = authenticatedUser ? authenticatedUser.user.id : null;
  
  // Estados principales
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCast, setLoadingCast] = useState(false);
  const [castDetails, setCastDetails] = useState(null);
  
  // Estados relacionados con valoraciones
  const [averageRating, setAverageRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [ratingValue, setRatingValue] = useState("");
  const [userRating, setUserRating] = useState(null);
  const [ratingErrors, setRatingErrors] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  // Estados para los modales
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Funciones de utilidad
  const parseMovieJson = (json) => {
    const ensureString = (value) => {
      if (value === null || value === undefined) return '';
      return String(value);
    };
    
    const createValidName = (person) => {
      if (person === null || person === undefined) return '';
      
      if (typeof person === 'string') return ensureString(person);
      
      if (typeof person === 'object') {
        if (person.name) return ensureString(person.name);
        
        if (person.firstName || person.lastName) {
          return ensureString((person.firstName || '') + ' ' + (person.lastName || '')).trim();
        }
      }
      
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

  // Funciones de carga de datos
  const loadCastDetails = (imdbId) => {
    setLoadingCast(true);
    getMovieCast(
      imdbId,
      (data) => {
        const processedCast = {
          actors: [],
          directors: []
        };
        
        if (Array.isArray(data)) {
          data.forEach(person => {
            if (person.job === "actor" || person.job === "actress") {
              processedCast.actors.push({
                imdbId: person.id,
                name: person.fullName,
                character: person.characters && person.characters.length > 0 ? person.characters[0] : null
              });
            } else if (person.job === "director") {
              processedCast.directors.push({
                imdbId: person.id,
                name: person.fullName
              });
            }
          });
        }
        
        setCastDetails(processedCast);
        updateMovieWithCast(processedCast);
        setLoadingCast(false);
      },
      (error) => {
        setLoadingCast(false);
      }
    );
  };

  const updateMovieWithCast = (processedCast) => {
    setMovie(prevMovie => {
      if (!prevMovie) return null;
      
      // Actualizar actores
      let updatedCast = getUpdatedCast(prevMovie.cast, processedCast.actors);
      // Actualizar directores
      let updatedDirectors = getUpdatedDirectors(prevMovie.directors, processedCast.directors);
      
      // Actualizar actores y directores en la base de datos
      updateActorsInDatabase(updatedCast);
      updateDirectorsInDatabase(updatedDirectors);
      
      // Crear objeto de película actualizada
      const updatedMovie = {
        ...prevMovie,
        cast: updatedCast.map(actor => ({
          name: actor.name,
          imdbId: actor.imdbId || null,
          character: actor.character || null
        })),
        directors: updatedDirectors.map(director => ({
          name: director.name,
          imdbId: director.imdbId || null
        }))
      };
      
      // Guardar la película actualizada
      saveMovie(updatedMovie, () => {}, () => {});
      
      return updatedMovie;
    });
  };

  const getUpdatedCast = (existingCast, apiActors) => {
    if (!existingCast || existingCast.length === 0) {
      return apiActors.map(actor => ({
        name: actor.name,
        imdbId: actor.imdbId,
        character: actor.character
      }));
    }
    
    let updatedCast = existingCast.map(actor => {
      const detailedActor = apiActors.find(
        a => a.name.toLowerCase() === actor.name.toLowerCase()
      );
      
      if (detailedActor) {
        return {
          ...actor,
          imdbId: detailedActor.imdbId,
          character: detailedActor.character
        };
      }
      return actor;
    });
    
    apiActors.forEach(apiActor => {
      const exists = updatedCast.some(
        actor => actor.name.toLowerCase() === apiActor.name.toLowerCase()
      );
      if (!exists) {
        updatedCast.push({
          name: apiActor.name,
          imdbId: apiActor.imdbId,
          character: apiActor.character
        });
      }
    });
    
    return updatedCast;
  };

  const getUpdatedDirectors = (existingDirectors, apiDirectors) => {
    if (!existingDirectors || existingDirectors.length === 0) {
      return apiDirectors.map(director => ({
        name: director.name,
        imdbId: director.imdbId
      }));
    }
    
    let updatedDirectors = existingDirectors.map(director => {
      const detailedDirector = apiDirectors.find(
        d => d.name.toLowerCase() === director.name.toLowerCase()
      );
      
      if (detailedDirector) {
        return {
          ...director,
          imdbId: detailedDirector.imdbId
        };
      }
      return director;
    });
    
    apiDirectors.forEach(apiDirector => {
      const exists = updatedDirectors.some(
        director => director.name.toLowerCase() === apiDirector.name.toLowerCase()
      );
      if (!exists) {
        updatedDirectors.push({
          name: apiDirector.name,
          imdbId: apiDirector.imdbId
        });
      }
    });
    
    return updatedDirectors;
  };

  const updateActorsInDatabase = (actors) => {
    actors.forEach(actor => {
      if (actor.imdbId) {
        const actorToUpdate = {
          name: actor.name,
          imdbId: actor.imdbId,
          firstName: actor.name.split(' ')[0] || actor.name
        };
        
        import('../../../backend/actorService').then(actorService => {
          actorService.updateActorByName(
            actor.name,
            actorToUpdate,
            () => {},
            () => {}
          );
        });
      }
    });
  };

  const updateDirectorsInDatabase = (directors) => {
    directors.forEach(director => {
      if (director.imdbId) {
        const directorToUpdate = {
          name: director.name,
          imdbId: director.imdbId,
          firstName: director.name.split(' ')[0] || director.name
        };
        
        import('../../../backend/directorService').then(directorService => {
          directorService.updateDirectorByName(
            director.name,
            directorToUpdate,
            () => {},
            () => {}
          );
        });
      }
    });
  };

  const loadUserRating = (movieImdbId) => {
    if (!userId) return;
    
    getUserRatingForMovie(
      userId,
      movieImdbId,
      (data) => {
        if (data && data.rating !== undefined) {
          setUserRating({
            rating: data.rating,
            id: data.id
          });
          setRatingValue(data.rating.toString());
        }
      },
      () => {}
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
      () => {
        setLoadingRating(false);
      }
    );
  };

  // Cargar datos iniciales
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
        
        saveMovie(
          parsedData,
          (savedMovie) => {
            if (savedMovie && savedMovie.imdbId) {
              loadAverageRating(savedMovie.imdbId);
              if (userId) {
                loadUserRating(savedMovie.imdbId);
              }
              loadCastDetails(savedMovie.imdbId);
            }
          }, 
          () => {}
        );
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [id, userId]);

  // Manejadores de eventos
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

  const handleAddToListClick = () => {
    if (!authenticatedUser) {
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    setShowAddToListModal(true);
  };

  const handleRateClick = () => {
    if (!authenticatedUser) {
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    setShowRatingForm(true);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    setRatingErrors(null);
    
    if (!userId) {
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    let valueFloat = parseFloat(ratingValue);
    
    // Validaciones
    if (ratingValue === "" || isNaN(valueFloat)) {
      setRatingErrors({ globalError: "Debes introducir un valor numérico." });
      return;
    }
    
    if (valueFloat < 0 || valueFloat > 10) {
      setRatingErrors({ globalError: "La valoración debe estar entre 0 y 10." });
      return;
    }
    
    if (!movie || !movie.imdbId) {
      setRatingErrors({ globalError: "No se puede valorar la película. Información de película no disponible." });
      return;
    }
    
    rateMovie(
      userId,
      movie.imdbId,
      valueFloat,
      (data) => {
        setUserRating({
          rating: data.rating,
          id: data.id
        });
        setRatingSuccess(true);
        setTimeout(() => setRatingSuccess(false), 3000);
        
        loadAverageRating(movie.imdbId);
        setShowRatingForm(false);
      },
      (errors) => {
        setRatingErrors(errors);
      }
    );
  };

  const handleDeleteRating = () => {
    if (!userId) {
      navigate("/login", { state: { from: `/movies/${id}` } });
      return;
    }
    
    if (!movie || !movie.imdbId) {
      setRatingErrors({ globalError: "No se puede eliminar la valoración. Información de película no disponible." });
      return;
    }
    
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteRating = () => {
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
        
        setRatingSuccess(true);
        setTimeout(() => {
          setRatingSuccess(false);
        }, 3000);
        
        loadAverageRating(movie.imdbId);
      },
      (errors) => {
        setRatingErrors(errors);
        setShowDeleteConfirmation(false);
      }
    );
  };

  // Renderizado condicional
  if (error) {
    return <ErrorState error={error} theme={theme} onBackClick={handleBackClick} />;
  }

  if (loading) {
    return <LoadingState theme={theme} />;
  }

  // Renderizado principal
  return (
    <div className="movie-detail-page">
      {/* Fondo con imagen de poster */}
      {movie.verticalPoster && (
        <div 
          className="movie-backdrop" 
          style={{ backgroundImage: `url(${movie.verticalPoster})` }}
        >
          <div className={`backdrop-overlay ${theme}`}></div>
        </div>
      )}
      
      <div className={`movie-detail-container ${theme}`}>
        {/* Cabecera */}
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
            loadingCast={loadingCast}
          />
        </div>
        
        {/* Sección de reseñas */}
        <div className="movie-section reviews-section">
          <MovieReviews movieId={movie.imdbId} authenticatedUser={authenticatedUser} />
        </div>
      </div>
      
      {/* Modales */}
      {showAddToListModal && (
        <AddToListModal
          movie={movie}
          onClose={() => setShowAddToListModal(false)}
          authenticatedUser={authenticatedUser}
        />
      )}
      
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