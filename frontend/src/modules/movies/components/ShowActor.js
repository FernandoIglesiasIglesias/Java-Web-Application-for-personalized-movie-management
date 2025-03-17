import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { saveMovie } from "../../../backend/movieService";
import "./ShowActor.css";

// Cache simple para almacenar respuestas de la API
const apiCache = {
  idByName: {},
  actorDetails: {},
  knownForMovies: {}, // Cache para películas conocidas básicas 
  movieDetails: {} // Cache para detalles completos de películas
};

const ShowActor = () => {
  const { actorName } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [actor, setActor] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState("init"); // Para mostrar progreso más detallado
  const [imageError, setImageError] = useState(false);
  const [knownForMovies, setKnownForMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [moviesError, setMoviesError] = useState(null);
  const [detailedMovies, setDetailedMovies] = useState([]);
  const [loadingDetailedMovies, setLoadingDetailedMovies] = useState(false);

  // Función para obtener el ID del actor - con caché
  const getActorId = useCallback(async (name) => {
    // Comprobar si ya tenemos este ID en caché
    if (apiCache.idByName[name]) {
      console.log("Usando ID de actor desde caché");
      return apiCache.idByName[name];
    }
    
    setLoadingStage("id");
    
    // Implementar reintentos para solicitudes fallidas
    let retries = 2;
    let idResponse;
    
    while (retries >= 0) {
      try {
        idResponse = await fetch(
          `https://moviesminidatabase.p.rapidapi.com/actor/imdb_id_byName/${encodeURIComponent(name)}/`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
              "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
            },
          }
        );
        
        if (idResponse.ok) break;
        
        // Si tenemos errores de límite de tarifa o servidor, esperar y reintentar
        if (idResponse.status === 429 || idResponse.status >= 500) {
          retries--;
          if (retries >= 0) {
            await new Promise(r => setTimeout(r, 1000)); // Esperar 1 segundo antes de reintentar
            continue;
          }
        }
        
        throw new Error(`Error en la API: ${idResponse.status}`);
      } catch (err) {
        retries--;
        if (retries < 0) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    const idData = await idResponse.json();
    
    if (!idData.results || idData.results.length === 0) {
      throw new Error("No se encontró información para este actor.");
    }
    
    // Guardar en caché
    const actorId = idData.results[0].imdb_id;
    apiCache.idByName[name] = actorId;
    
    return actorId;
  }, []);

  // Función para obtener detalles del actor - con caché
  const getActorDetails = useCallback(async (actorId) => {
    // Comprobar si ya tenemos estos detalles en caché
    if (apiCache.actorDetails[actorId]) {
      console.log("Usando detalles de actor desde caché");
      return apiCache.actorDetails[actorId];
    }
    
    setLoadingStage("details");
    
    // Implementar reintentos para solicitudes fallidas
    let retries = 2;
    let detailsResponse;
    
    while (retries >= 0) {
      try {
        detailsResponse = await fetch(
          `https://moviesminidatabase.p.rapidapi.com/actor/id/${actorId}/`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
              "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
            },
          }
        );
        
        if (detailsResponse.ok) break;
        
        // Si tenemos errores de límite de tarifa o servidor, esperar y reintentar
        if (detailsResponse.status === 429 || detailsResponse.status >= 500) {
          retries--;
          if (retries >= 0) {
            await new Promise(r => setTimeout(r, 1000)); // Esperar 1 segundo antes de reintentar
            continue;
          }
        }
        
        throw new Error(`Error en la API: ${detailsResponse.status}`);
      } catch (err) {
        retries--;
        if (retries < 0) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.results) {
      throw new Error("No se encontraron detalles para este actor.");
    }
    
    // Guardar en caché
    apiCache.actorDetails[actorId] = detailsData.results;
    
    return detailsData.results;
  }, []);

  // Función para obtener las películas conocidas del actor
  const getKnownForMovies = useCallback(async (actorId) => {
    // Comprobar si ya tenemos estos datos en caché
    if (apiCache.knownForMovies[actorId]) {
      console.log("Usando películas conocidas desde caché");
      return apiCache.knownForMovies[actorId];
    }
    
    // Implementar reintentos para solicitudes fallidas
    let retries = 2;
    let moviesResponse;
    
    while (retries >= 0) {
      try {
        moviesResponse = await fetch(
          `https://moviesminidatabase.p.rapidapi.com/actor/id/${actorId}/movies_knownFor/`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
              "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
            },
          }
        );
        
        if (moviesResponse.ok) break;
        
        // Si tenemos errores de límite de tarifa o servidor, esperar y reintentar
        if (moviesResponse.status === 429 || moviesResponse.status >= 500) {
          retries--;
          if (retries >= 0) {
            await new Promise(r => setTimeout(r, 1000)); // Esperar 1 segundo antes de reintentar
            continue;
          }
        }
        
        throw new Error(`Error en la API: ${moviesResponse.status}`);
      } catch (err) {
        retries--;
        if (retries < 0) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    const moviesData = await moviesResponse.json();
    
    if (!moviesData.results || moviesData.results.length === 0) {
      return []; // No hay películas conocidas
    }
    
    // Procesar los datos para obtener una estructura más limpia
    const processedMovies = moviesData.results.map(movieData => {
      const [movieInfo] = movieData;
      return {
        imdbId: movieInfo.imdb_id,
        title: movieInfo.title,
        rating: movieInfo.rating
      };
    });
    
    // Guardar en caché
    apiCache.knownForMovies[actorId] = processedMovies;
    
    return processedMovies;
  }, []);

  // Función para obtener detalles completos de una película usando la API de streaming
  const getMovieDetails = useCallback(async (imdbId) => {
    // Comprobar si ya tenemos estos detalles en caché
    if (apiCache.movieDetails[imdbId]) {
      console.log(`Usando detalles de película ${imdbId} desde caché`);
      return apiCache.movieDetails[imdbId];
    }
    
    try {
      const response = await fetch(
        `https://streaming-availability.p.rapidapi.com/shows/${imdbId}?series_granularity=episode&output_language=es`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
            "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.message) {
        throw new Error(data.message);
      }
      
      const parsedData = parseMovieJson(data);
      
      // Guardar película en base de datos local
      saveMovie(
        parsedData, 
        () => console.log(`Película ${imdbId} guardada correctamente en la base de datos`), 
        (error) => console.error(`Error guardando película ${imdbId}`, error)
      );
      
      // Guardar en caché
      apiCache.movieDetails[imdbId] = parsedData;
      
      return parsedData;
    } catch (error) {
      console.error(`Error al obtener detalles de película ${imdbId}:`, error);
      return null;
    }
  }, []);

  // Función para parsear los datos de la película (similar a la de ShowMovie.js)
  const parseMovieJson = (json) => {
    const parseName = (name) => {
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
      verticalPoster: json.imageSet?.verticalPoster?.w240,
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

  // Función para cargar detalles completos de todas las películas conocidas
  const loadDetailedMovieInfo = useCallback(async (basicMovies) => {
    if (!basicMovies || basicMovies.length === 0) return [];
    
    setLoadingDetailedMovies(true);
    
    // Seleccionar solo las películas mejor valoradas (máximo 6)
    const topMovies = [...basicMovies]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
    
    try {
      // Cargar detalles en paralelo con Promise.all para optimizar
      const detailedResults = await Promise.all(
        topMovies.map(async (movie) => {
          const details = await getMovieDetails(movie.imdbId);
          
          // Si no se pudo obtener detalles, mantener la información básica
          if (!details) {
            return {
              ...movie,
              failed: true
            };
          }
          
          return {
            ...details,
            originalRating: movie.rating // Mantener el rating original
          };
        })
      );
      
      // Filtrar películas fallidas y ordenar por valoración original
      const validMovies = detailedResults
        .filter(movie => !movie.failed)
        .sort((a, b) => b.originalRating - a.originalRating);
      
      setDetailedMovies(validMovies);
    } catch (err) {
      console.error("Error cargando detalles de películas:", err);
    } finally {
      setLoadingDetailedMovies(false);
    }
  }, [getMovieDetails]);
  
  // Función principal para obtener todos los datos del actor
  const fetchActorDetails = useCallback(async () => {
    setLoading(true);
    setLoadingStage("init");
    
    try {
      // Obtener ID e información en secuencia
      const actorId = await getActorId(actorName);
      const actorDetails = await getActorDetails(actorId);
      
      setActor(actorDetails);
      setLoading(false);
      
      // Una vez que tengamos los detalles básicos, cargar las películas conocidas
      setLoadingMovies(true);
      try {
        const movies = await getKnownForMovies(actorId);
        setKnownForMovies(movies);
        
        // Iniciar carga de detalles completos de películas
        if (movies.length > 0) {
          loadDetailedMovieInfo(movies);
        }
      } catch (err) {
        console.error("Error al cargar películas conocidas:", err);
        setMoviesError(err);
      } finally {
        setLoadingMovies(false);
      }
      
    } catch (err) {
      console.error("Error al cargar detalles del actor:", err);
      setError(err);
      setLoading(false);
    }
  }, [actorName, getActorId, getActorDetails, getKnownForMovies, loadDetailedMovieInfo]);

  useEffect(() => {
    fetchActorDetails();
  }, [fetchActorDetails]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleRetryClick = () => {
    setError(null);
    fetchActorDetails();
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .slice(0, 2);
  };

  const handleImageError = () => {
    console.log("Error al cargar la imagen del actor");
    setImageError(true);
  };

  // Función para navegar a la página de una película
  const handleMovieClick = (imdbId) => {
    navigate(`/movies/${imdbId}`);
  };

  // Renderizar estado de error
  if (error) {
    return (
      <div className={`actor-error-container ${theme}`}>
        <div className="actor-error-content">
          <div className="actor-error-icon">❌</div>
          <h2>Ha ocurrido un error</h2>
          <p>{error.message || "No se pudo cargar la información del actor"}</p>
          <div className="error-actions">
            <button 
              className={`actor-button primary ${theme}`}
              onClick={handleRetryClick}
            >
              Reintentar
            </button>
            <button 
              className={`actor-button secondary ${theme}`}
              onClick={handleBackClick}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar estado de carga con más detalles sobre el progreso
  if (loading) {
    return (
      <div className={`actor-loading-container ${theme}`}>
        <div className="loading-spinner actor-spinner"></div>
        <p className="loading-text">
          {loadingStage === "init" && "Iniciando búsqueda..."}
          {loadingStage === "id" && "Buscando información del actor..."}
          {loadingStage === "details" && "Cargando detalles del actor..."}
        </p>
        <p className="loading-progress">
          {loadingStage === "id" ? "Paso 1/2" : loadingStage === "details" ? "Paso 2/2" : "Preparando..."}
        </p>
        
        {/* Skeleton loader para dar sensación de carga más rápida */}
        <div className="actor-skeleton">
          <div className="actor-skeleton-header"></div>
          <div className="actor-skeleton-content">
            <div className="actor-skeleton-image"></div>
            <div className="actor-skeleton-info">
              <div className="actor-skeleton-title"></div>
              <div className="actor-skeleton-meta"></div>
              <div className="actor-skeleton-meta"></div>
              <div className="actor-skeleton-bio"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="actor-detail-page">
      {/* Fondo con imagen de actor desenfocada para dar profundidad */}
      {actor.image_url && !imageError && (
        <div 
          className="actor-backdrop" 
          style={{ backgroundImage: `url(${actor.image_url})` }}
        >
          <div className={`backdrop-overlay ${theme}`}></div>
        </div>
      )}
      
      <div className={`actor-detail-container ${theme}`}>
        {/* Cabecera con botón para volver atrás */}
        <div className="actor-detail-nav">
          <button 
            className={`back-button ${theme}`}
            onClick={handleBackClick}
            aria-label="Volver atrás"
          >
            ← Volver
          </button>
        </div>
        
        <div className="actor-detail-content">
          {/* Foto del actor */}
          <div className="actor-details-image-container">
            {actor.image_url && !imageError ? (
              <img
                src={actor.image_url}
                alt={actor.name || "Foto del actor"}
                className="actor-image"
                onError={handleImageError}
              />
            ) : actor.name ? (
              <div className="actor-initials">
                {getInitials(actor.name)}
              </div>
            ) : (
              <div className="actor-image-error-container">
                <div className="actor-image-error-icon">🖼️</div>
                <span className="actor-image-error-text">Imagen no disponible</span>
              </div>
            )}
          </div>
          
          {/* Información principal */}
          <div className="actor-info-container">
            <div className="actor-header-info">
              <h1 className="actor-title">{actor.name || "Nombre no disponible"}</h1>
              
              <div className="actor-meta">
                {actor.birth_date && (
                  <span className="actor-birth">
                    <span className="meta-label">Fecha de nacimiento:</span> {actor.birth_date}
                  </span>
                )}
                {actor.birth_place && (
                  <span className="actor-birthplace">
                    <span className="meta-label">Lugar de nacimiento:</span> {actor.birth_place}
                  </span>
                )}
                {actor.star_sign && (
                  <span className="actor-starsign">
                    <span className="meta-label">Signo del zodiaco:</span> {actor.star_sign}
                  </span>
                )}
                {actor.height && (
                  <span className="actor-height">
                    <span className="meta-label">Altura:</span> {actor.height.trim()}
                  </span>
                )}
              </div>
            </div>
            
            {actor.partial_bio && (
              <div className="actor-section">
                <h2>Biografía</h2>
                <p className="actor-bio">{actor.partial_bio}</p>
              </div>
            )}
            
            {/* Sección de películas conocidas con detalles completos */}
            <div className="actor-section">
              <h2>Películas destacadas</h2>
              
              {loadingMovies ? (
                <div className="known-movies-loading">
                  <div className="movie-cards-skeleton">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="movie-card-skeleton">
                        <div className="movie-poster-skeleton"></div>
                        <div className="movie-title-skeleton"></div>
                        <div className="movie-rating-skeleton"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : moviesError ? (
                <p className="movies-error">
                  No se pudieron cargar las películas destacadas.
                </p>
              ) : knownForMovies.length === 0 ? (
                <p className="no-known-movies">
                  No hay información disponible sobre películas destacadas.
                </p>
              ) : (
                <div className="detailed-movies-section">
                  {/* Si tenemos detalles mejorados, mostrarlos. Si no, mostrar versión básica */}
                  {detailedMovies.length > 0 ? (
                    <div className="detailed-movies-grid">
                      {detailedMovies.map((movie) => (
                        <div 
                          key={movie.imbdId} 
                          className={`detailed-movie-card ${theme}`}
                          onClick={() => handleMovieClick(movie.imbdId)}
                        >
                          <div className="detailed-movie-poster-container">
                            {movie.verticalPoster ? (
                              <img
                                src={movie.verticalPoster}
                                alt={movie.title}
                                className="detailed-movie-poster"
                              />
                            ) : (
                              <div className="detailed-movie-poster-placeholder">
                                <span>No disponible</span>
                              </div>
                            )}
                            <div className="detailed-movie-overlay">
                              <div className="detailed-movie-year">
                                {movie.releaseYear || '??'}
                              </div>
                              <div className="detailed-movie-rating">
                                {movie.imdbRating ? `★ ${movie.imdbRating.toFixed(1)}` : `★ ${movie.originalRating.toFixed(1)}`}
                              </div>
                            </div>
                          </div>
                          <div className="detailed-movie-info">
                            <h3 className="detailed-movie-title">{movie.title}</h3>
                            {movie.genres && movie.genres.length > 0 && (
                              <p className="detailed-movie-genres">
                                {movie.genres.slice(0, 2).map(g => g.name).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {loadingDetailedMovies && <div className="loading-overlay">Cargando detalles...</div>}
                    </div>
                  ) : (
                    <div className="known-movies-grid">
                      {knownForMovies.map((movie) => (
                        <div 
                          key={movie.imdbId} 
                          className={`known-movie-card ${theme}`}
                          onClick={() => handleMovieClick(movie.imdbId)}
                        >
                          <div className="known-movie-rating">★ {movie.rating.toFixed(1)}</div>
                          <h3 className="known-movie-title">{movie.title}</h3>
                        </div>
                      ))}
                      {loadingDetailedMovies && <div className="loading-detailed-movies">Cargando más detalles...</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowActor;