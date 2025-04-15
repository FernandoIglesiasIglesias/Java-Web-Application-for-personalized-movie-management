import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { saveMovie, getMovieCast } from "../../../backend/movieService";
import { 
  rateMovie, 
  getUserRatingForMovie,
  getAverageRatingForMovie,
  deleteRating
} from "../../../backend/rateService";
import { createActor, getActorByName, getActorByImdbId, updateActorByName } from "../../../backend/actorService";
import { createDirector, getDirectorByName, getDirectorByImdbId, updateDirectorByName } from "../../../backend/directorService";
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const userId = authenticatedUser ? authenticatedUser.user.id : null;
  
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCast, setLoadingCast] = useState(false);
  const [castDetails, setCastDetails] = useState(null);
  
  const [averageRating, setAverageRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [ratingValue, setRatingValue] = useState("");
  const [userRating, setUserRating] = useState(null);
  const [ratingErrors, setRatingErrors] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Caché para evitar procesamiento duplicado de actores y directores
  const processedPersonsCache = useRef(new Map()).current;
  // Referencia para almacenar el estado actual de la película
  const movieRef = useRef(null);

  // Actualizar la referencia cuando cambie el estado de movie
  useEffect(() => {
    movieRef.current = movie;
  }, [movie]);

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

  const saveActorToDatabase = async (actor) => {
    if (!actor?.name || !actor?.imdbId) {
      return null;
    }
  
    try {
      const actorData = {
        name: actor.name,
        imdbId: String(actor.imdbId).trim(),
        // Eliminamos el character para no guardarlo en BD
      };
  
      return new Promise((resolve) => {
        createActor(
          actorData,
          (createdActor) => {
            // Añadimos el personaje al objeto retornado pero sin enviarlo a BD
            if (actor.character) {
              createdActor.character = actor.character;
            }
            resolve(createdActor);
          },
          (error) => {
            resolve(null);
          }
        );
      });
    } catch (error) {
      return null;
    }
  };
  
  const saveDirectorToDatabase = async (director) => {
    if (!director?.name || !director?.imdbId) {
      return null;
    }
  
    try {
      const directorData = {
        name: director.name,
        imdbId: String(director.imdbId).trim(),
      };
  
      return new Promise((resolve) => {
        createDirector(
          directorData,
          (createdDirector) => resolve(createdDirector),
          (error) => {
            resolve(null);
          }
        );
      });
    } catch (error) {
      return null;
    }
  };
  
  const loadCastDetails = (imdbId) => {
    if (!imdbId || loadingCast) return; // Added loadingCast check to prevent duplicate calls
    
      // Skip if cast is already loaded
      if (movieRef.current && movieRef.current.castLoaded && 
          movieRef.current.imdbId === imdbId) {
        return;
      }
    
    setLoadingCast(true);
    
    getMovieCast(
      imdbId,
      (data) => {
        try {
          const processedCast = {
            actors: [],
            directors: []
          };
          
          if (Array.isArray(data)) {
            data.forEach(person => {
              // Verify valid ID
              if (!person?.id) return;
              
              // Ensure it's a string
              const personImdbId = String(person.id);
              const personName = person.fullName || '';
              
              if (!personImdbId || !personName) {
                return;
              }
              
              if (person.job === "actor" || person.job === "actress") {
                processedCast.actors.push({
                  imdbId: personImdbId,
                  name: personName,
                  character: person.characters?.[0] || null
                });
              } else if (person.job === "director") {
                processedCast.directors.push({
                  imdbId: personImdbId,
                  name: personName
                });
              }
            });
          }
                    
          if (processedCast.actors.length > 0 || processedCast.directors.length > 0) {
            updateMovieWithCast(processedCast);
          } else {
            setLoadingCast(false);
          }
        } catch (error) {
          setLoadingCast(false);
        }
      },
      (error) => {
        setLoadingCast(false);
      }
    );
  };

  const updateMovieWithCast = async (processedCast) => {
    try {      
      // Filtrar actores y directores duplicados antes de procesar
      // Set para rastrear los nombres e imdbIds ya procesados para evitar duplicados
      const processedActorNames = new Set();
      const processedActorIds = new Set();
      const processedDirectorNames = new Set();
      const processedDirectorIds = new Set();
      
      // Filtrar actores duplicados
      const uniqueActors = (processedCast.actors || []).filter(actor => {
        if (!actor || !actor.name) return false;
        
        // Normalizar nombre e ID
        const normalizedName = actor.name.toLowerCase().trim();
        const normalizedId = actor.imdbId ? String(actor.imdbId).trim() : null;
        
        // Si ya hemos procesado este actor por nombre o ID, omitirlo
        if (normalizedId && processedActorIds.has(normalizedId)) {
          return false;
        }
        
        if (processedActorNames.has(normalizedName)) {
          return false;
        }
        
        // Marcar este actor como procesado
        if (normalizedId) processedActorIds.add(normalizedId);
        processedActorNames.add(normalizedName);
        
        return true;
      });
      
      // Hacer lo mismo para directores
      const uniqueDirectors = (processedCast.directors || []).filter(director => {
        if (!director || !director.name) return false;
        
        const normalizedName = director.name.toLowerCase().trim();
        const normalizedId = director.imdbId ? String(director.imdbId).trim() : null;
        
        if (normalizedId && processedDirectorIds.has(normalizedId)) {
          return false;
        }
        
        if (processedDirectorNames.has(normalizedName)) {
          return false;
        }
        
        if (normalizedId) processedDirectorIds.add(normalizedId);
        processedDirectorNames.add(normalizedName);
        
        return true;
      });
            
      // Crear promesas para actores/directores filtrados
      const actorPromises = uniqueActors.map(actor => {
        return () => saveActorToDatabase(actor);
      });
      
      const directorPromises = uniqueDirectors.map(director => {
        return () => saveDirectorToDatabase(director);
      });
      
      // Process actors sequentially to avoid race conditions
      const savedActors = [];
      const processedImdbIds = new Set();
  
      for (const actorPromise of actorPromises) {
        const savedActor = await actorPromise();
        if (savedActor && savedActor.imdbId && !processedImdbIds.has(savedActor.imdbId)) {
          processedImdbIds.add(savedActor.imdbId);
          savedActors.push(savedActor);
        } else if (savedActor && !savedActor.imdbId) {
          savedActors.push(savedActor);
        }
      }
      
      // Process directors sequentially
      const savedDirectors = [];
      for (const directorPromise of directorPromises) {
        const savedDirector = await directorPromise();
        if (savedDirector && savedDirector.imdbId && !processedImdbIds.has(savedDirector.imdbId)) {
          processedImdbIds.add(savedDirector.imdbId);
          savedDirectors.push(savedDirector);
        } else if (savedDirector && !savedDirector.imdbId) {
          savedDirectors.push(savedDirector);
        }
      }
      
      // Update the movie state once with the complete cast
      setMovie(prevMovie => {
        if (!prevMovie) return null;
        
        const mergeArrays = (existingItems, newItems) => {
          // Create a Map with imdbId or name as keys to avoid duplicates
          const combinedMap = new Map();
          
          // Process existing items first
          if (Array.isArray(existingItems)) {
            existingItems.forEach(item => {
              if (item && item.imdbId) {
                // Normalizar el ID de IMDB (asegurarse de que es un string y no tiene espacios)
                const normalizedImdbId = String(item.imdbId).trim();
                if (normalizedImdbId) {
                  combinedMap.set(normalizedImdbId, item);
                }
              } else if (item && item.name) {
                // Normalizar nombre para comparación insensible a mayúsculas/minúsculas
                const normalizedName = item.name.toLowerCase().trim().replace(/\s+/g, ' ');
                combinedMap.set(`name-${normalizedName}`, item);
              }
            });
          }
          
          // Process new items, checking for duplicates more carefully
          if (Array.isArray(newItems)) {
            newItems.forEach(item => {
              if (!item) return;
              
              // Try to find matching existing item by imdbId or name
              let existingItem = null;
              let itemKey = null;
              
              if (item.imdbId) {
                // Normalizar el ID de IMDB del nuevo elemento
                const normalizedImdbId = String(item.imdbId).trim();
                if (normalizedImdbId) {
                  // Check by imdbId
                  existingItem = combinedMap.get(normalizedImdbId);
                  itemKey = normalizedImdbId;
                }
              }
              
              if (!existingItem && item.name) {
                // Si no se encuentra por imdbId, buscar por nombre normalizado
                const normalizedName = item.name.toLowerCase().trim().replace(/\s+/g, ' ');
                const nameKey = `name-${normalizedName}`;
                existingItem = combinedMap.get(nameKey);
                
                if (!itemKey) {
                  itemKey = nameKey;
                }
              }
              
              // Si se encontró un elemento existente, fusionarlo con el nuevo
              if (existingItem) {
                const mergedItem = {
                  ...existingItem,
                  ...item,
                  // Asegurar que se preserva el ID de IMDB (prioridad para el nuevo)
                  imdbId: item.imdbId || existingItem.imdbId,
                  character: item.character || existingItem.character
                };
                
                // Si el elemento fusionado tiene imdbId, usarlo como clave
                if (mergedItem.imdbId) {
                  const normalizedImdbId = String(mergedItem.imdbId).trim();
                  combinedMap.set(normalizedImdbId, mergedItem);
                  
                  // Si teníamos una entrada basada en nombre, eliminarla para evitar duplicados
                  if (existingItem.name) {
                    const normalizedName = existingItem.name.toLowerCase().trim().replace(/\s+/g, ' ');
                    combinedMap.delete(`name-${normalizedName}`);
                  }
                } else if (mergedItem.name) {
                  // Si no hay imdbId, usar el nombre como clave
                  const normalizedName = mergedItem.name.toLowerCase().trim().replace(/\s+/g, ' ');
                  combinedMap.set(`name-${normalizedName}`, mergedItem);
                }
              } else {
                // Si no existe un elemento para fusionar, agregar el nuevo
                if (item.imdbId) {
                  const normalizedImdbId = String(item.imdbId).trim();
                  combinedMap.set(normalizedImdbId, item);
                } else if (item.name) {
                  const normalizedName = item.name.toLowerCase().trim().replace(/\s+/g, ' ');
                  combinedMap.set(`name-${normalizedName}`, item);
                }
              }
            });
          }
          
          // Convertir mapa a array para devolver
          return Array.from(combinedMap.values());
        };
        
        const updatedMovie = {
          ...prevMovie,
          cast: mergeArrays(prevMovie.cast || [], savedActors),
          directors: mergeArrays(prevMovie.directors || [], savedDirectors),
          castLoaded: true // Add this flag to track if we've already loaded cast
        };
        
        // Update the reference
        movieRef.current = updatedMovie;
        
        return updatedMovie;
      });
      
      // Save the updated movie to database
      const currentMovie = movieRef.current;
      if (currentMovie && currentMovie.imdbId) {
        try {
          await new Promise((resolve, reject) => {
            // Make a clean copy with only the necessary data
            const movieToSave = {
              ...currentMovie,
              cast: (currentMovie.cast || []).map(actor => ({
                name: actor.name,
                imdbId: actor.imdbId || null,
                // No incluimos el character al guardar
              })),
              directors: (currentMovie.directors || []).map(director => ({
                name: director.name,
                imdbId: director.imdbId || null
              }))
            };
            
            saveMovie(
              movieToSave,
              (savedMovie) => {
                resolve(savedMovie);
              },
              (error) => {
                reject(error);
              }
            );
          });
        } catch (error) {
          console.error("Error saving movie:", error);
        }
      }
      
      setLoadingCast(false);
    } catch (error) {
      console.error("Error en updateMovieWithCast:", error);
      setLoadingCast(false);
    }
  };
  
  const loadUserRating = (movieImdbId) => {
    if (!userId || !movieImdbId) return;
    
    try {
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
        () => {} // Silently ignore errors
      );
    } catch (error) {
      // Ignorar errores silenciosamente
    }
  };

  const loadAverageRating = (movieImdbId) => {
    if (!movieImdbId) return;
    
    setLoadingRating(true);
    try {
      getAverageRatingForMovie(
        movieImdbId,
        (rating) => {
          setAverageRating(rating);
          setLoadingRating(false);
        },
        () => {
          setAverageRating(null);
          setLoadingRating(false);
        }
      );
    } catch (error) {
      setAverageRating(null);
      setLoadingRating(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    setLoading(true);
    
    if (!id) {
      setError(new Error("ID de película no válido"));
      setLoading(false);
      return;
    }
    
    // Clear cache only when navigating to a different movie
    if (movieRef.current?.imdbId !== id) {
      processedPersonsCache.clear();
    }
    
    fetch(
      `https://streaming-availability.p.rapidapi.com/shows/${id}?series_granularity=episode&output_language=es`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
          "x-rapidapi-key": "cdbfa3dd29mshcd4df13fafdf647p1c3170jsn3d0e626a103b",
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
        parsedData.castLoaded = false; // Initialize the flag
        setMovie(parsedData);
        movieRef.current = parsedData;
        setLoading(false);
        
        // Use one-time flag to avoid multiple triggers
        let dataProcessed = false;
        
        // Separar la lógica para evitar bloquear la visualización
        setTimeout(() => {
          try {
            if (dataProcessed) return;
            dataProcessed = true;
            
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
              (error) => {
                console.error("Error al guardar película:", error);
              }
            );
          } catch (error) {
            console.error("Error en el guardado inicial:", error);
          }
        }, 100);
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
    
    try {
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
    } catch (error) {
      setRatingErrors({ globalError: "Error al enviar la valoración." });
    }
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
    
    try {
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
    } catch (error) {
      setRatingErrors({ globalError: "Error al eliminar la valoración." });
      setShowDeleteConfirmation(false);
    }
  };

  // Componente ErrorBoundary para manejar errores en MovieReviews
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return this.props.fallback;
      }
      return this.props.children;
    }
  }

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
          {movie && movie.imdbId ? (
            <ErrorBoundary fallback={<div className={`no-reviews-container ${theme}`}>
              <p>No se pueden cargar las reseñas en este momento</p>
            </div>}>
              <MovieReviews 
                key={movie.imdbId} // Añadir una key para forzar remontaje cuando cambia el ID
                movieId={movie.imdbId} 
                authenticatedUser={authenticatedUser} 
              />
            </ErrorBoundary>
          ) : (
            <div className={`no-reviews-container ${theme}`}>
              <p>No se pueden cargar reseñas para esta película</p>
            </div>
          )}
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