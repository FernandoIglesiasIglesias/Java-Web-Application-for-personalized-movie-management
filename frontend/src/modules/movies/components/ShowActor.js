import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { updateActorByName } from '../../../backend/actorService';
import './ShowActor.css';

// Cache para reducir solicitudes a la API
const apiCache = {
  idByName: {},
  actorDetails: {},
  knownFor: {},
  movieDetails: {}
};

// Función para obtener iniciales de un nombre
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Componente principal
const ShowActor = () => {
  const { actorName } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Estados para gestionar datos y UI
  const [actor, setActor] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('init');
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // Estados para películas conocidas
  const [knownForMovies, setKnownForMovies] = useState([]);
  const [detailedMovies, setDetailedMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingDetailedMovies, setLoadingDetailedMovies] = useState(false);
  const [moviesError, setMoviesError] = useState(null);

  // Función para obtener ID del actor - con caché
  const getActorId = useCallback(async (name) => {
    // Comprobar si ya tenemos este ID en caché
    if (apiCache.idByName[name]) {
      console.log("Usando ID de actor desde caché");
      return apiCache.idByName[name];
    }
    
    setLoadingStage("id");
    
    const idResponse = await fetch(
      `https://moviesminidatabase.p.rapidapi.com/actor/imdb_id_byName/${encodeURIComponent(name)}/`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
          "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
        },
      }
    );
    
    if (!idResponse.ok) {
      throw new Error(`Error en la API de búsqueda: ${idResponse.status}`);
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
        await new Promise(r => setTimeout(r, 1000)); // Esperar antes de reintentar
      }
    }
    
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.results || Object.keys(detailsData.results).length === 0) {
      throw new Error("No se pudieron obtener los detalles del actor.");
    }
    
    const results = detailsData.results;
    
    // Procesar los datos del actor para nuestro formato
    const formattedActor = {
      id: actorId,
      imdbId: actorId,
      name: `${results.name || ''} ${results.surname || ''}`.trim(),
      firstName: results.name || '',
      lastName: results.surname || '',
      image_url: results.image_url,
      birth_date: results.birth_date,
      birth_place: results.birth_place,
      star_sign: results.star_sign,
      height: results.height,
      partial_bio: results.partial_bio || results.bio,
      // Datos adicionales para guardar en nuestra BD
      bio: results.bio || results.partial_bio || '',
      tmdbId: results.tmdb_id || ''
    };
    
    // Guardar en caché
    apiCache.actorDetails[actorId] = formattedActor;
    
    // Actualizar información en nuestra base de datos
    updateActorInDatabase(formattedActor);
    
    return formattedActor;
  }, []);

  // Función para actualizar el actor en la base de datos
  const updateActorInDatabase = useCallback((actorData) => {
    if (!actorData.firstName || !actorData.lastName) {
      console.warn("No se puede actualizar el actor sin nombre completo:", actorData);
      return;
    }

    const dbActorData = {
      firstName: actorData.firstName,
      lastName: actorData.lastName,
      imdbId: actorData.imdbId,
      tmdbId: actorData.tmdbId || '',
      birthDate: actorData.birth_date || null,
      birthPlace: actorData.birth_place || '',
      starSign: actorData.star_sign || '',
      height: actorData.height || '',
      bio: actorData.bio || '',
      imageUrl: actorData.image_url || ''
    };

    updateActorByName(
      actorData.firstName,
      actorData.lastName,
      dbActorData,
      (result) => {
        console.log("Actor actualizado en la base de datos:", result);
      },
      (error) => {
        console.error("Error actualizando actor en la base de datos:", error);
      }
    );
  }, []);

  // Función para obtener películas conocidas del actor - con caché
  const getKnownForMovies = useCallback(async (actorId) => {
    // Comprobar caché
    if (apiCache.knownFor[actorId]) {
      console.log("Usando películas conocidas desde caché");
      return apiCache.knownFor[actorId];
    }
    
    const knownForResponse = await fetch(
      `https://moviesminidatabase.p.rapidapi.com/actor/id/${actorId}/movies_knownFor/`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
          "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
        },
      }
    );
    
    if (!knownForResponse.ok) {
      throw new Error(`Error obteniendo películas: ${knownForResponse.status}`);
    }
    
    const knownForData = await knownForResponse.json();
    
    if (!knownForData.results || knownForData.results.length === 0) {
      return [];
    }
    
    // Procesar y ordenar por valoración
    const movies = knownForData.results.map(movie => ({
      imdbId: movie.imdb_id,
      title: movie.title,
      year: movie.year,
      role: movie.role,
      rating: parseFloat(movie.rating) || 0
    })).sort((a, b) => b.rating - a.rating);
    
    // Guardar en caché
    apiCache.knownFor[actorId] = movies;
    
    return movies;
  }, []);

  // Función para obtener detalles de una película - con caché
  const getMovieDetails = useCallback(async (imdbId) => {
    // Comprobar caché
    if (apiCache.movieDetails[imdbId]) {
      return apiCache.movieDetails[imdbId];
    }
    
    try {
      const detailsResponse = await fetch(
        `https://moviesminidatabase.p.rapidapi.com/movie/id/${imdbId}/`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
            "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
          },
        }
      );
      
      if (!detailsResponse.ok) {
        return null;
      }
      
      const detailsData = await detailsResponse.json();
      
      if (!detailsData.results) {
        return null;
      }
      
      // Procesar datos de película
      const movie = {
        imdbId: imdbId,
        title: detailsData.results.title,
        year: detailsData.results.year,
        image_url: detailsData.results.image_url,
        plot: detailsData.results.plot,
        contentRating: detailsData.results.content_rating,
        rating: parseFloat(detailsData.results.rating) || 0,
        genres: detailsData.results.gen?.map(g => g.genre) || []
      };
      
      // Guardar en caché
      apiCache.movieDetails[imdbId] = movie;
      
      return movie;
    } catch (err) {
      console.error("Error obteniendo detalles de película:", err);
      return null;
    }
  }, []);

  // Función para cargar detalles de películas conocidas
  const loadDetailedMovieInfo = useCallback(async (movies) => {
    setLoadingDetailedMovies(true);
    
    // Seleccionamos solo las 6 mejores películas
    const topMovies = movies
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

  // Efecto para cargar datos inicialmente
  useEffect(() => {
    if (actorName) {
      fetchActorDetails();
    }
  }, [actorName, fetchActorDetails]);

  // Manejadores de eventos
  const handleImageError = () => {
    setImageError(true);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleRetryClick = () => {
    setError(null);
    setMoviesError(null);
    setImageError(false);
    fetchActorDetails();
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
                        <div className="movie-meta-skeleton"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : moviesError ? (
                <div className="known-movies-error">
                  <p>No se pudieron cargar las películas relacionadas.</p>
                  <button 
                    className={`actor-button small ${theme}`}
                    onClick={() => {
                      setMoviesError(null);
                      setLoadingMovies(true);
                      getKnownForMovies(actor.id)
                        .then(setKnownForMovies)
                        .catch(setMoviesError)
                        .finally(() => setLoadingMovies(false));
                    }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : detailedMovies.length > 0 ? (
                <div className="known-movies-grid">
                  {detailedMovies.map((movie) => (
                    <div key={movie.imdbId} className={`movie-card ${theme}`}>
                      <div className="movie-poster-container">
                        {movie.image_url ? (
                          <img 
                            src={movie.image_url} 
                            alt={movie.title} 
                            className="movie-poster"
                          />
                        ) : (
                          <div className="movie-poster-placeholder">
                            🎬
                          </div>
                        )}
                        <div className="movie-rating">
                          <span className="rating-value">
                            {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="movie-info">
                        <h3 className="movie-title">{movie.title}</h3>
                        <div className="movie-meta">
                          <span className="movie-year">{movie.year}</span>
                          {movie.genres && movie.genres.length > 0 && (
                            <span className="movie-genres">
                              {movie.genres.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                        {movie.plot && (
                          <p className="movie-plot">{movie.plot.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : knownForMovies.length > 0 ? (
                <div className="known-movies-basic">
                  <ul>
                    {knownForMovies.slice(0, 5).map(movie => (
                      <li key={movie.imdbId}>
                        <strong>{movie.title}</strong> ({movie.year}) 
                        - Rating: {movie.rating}
                        {movie.role && <span className="movie-role"> as {movie.role}</span>}
                      </li>
                    ))}
                  </ul>
                  {loadingDetailedMovies && (
                    <div className="loading-inline">
                      <div className="loading-spinner small"></div>
                      <span>Cargando más detalles...</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-movies-message">
                  No se encontraron películas destacadas para este actor.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Pie de página con información adicional */}
        <div className="actor-footer">
          <div className={`actor-footer-content ${theme}`}>
            <p className="actor-disclaimer">
              Información proporcionada por bases de datos de películas externas.
            </p>
            <p className="actor-imdb-link">
              {actor.imdbId && (
                <a 
                  href={`https://www.imdb.com/name/${actor.imdbId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`imdb-button ${theme}`}
                >
                  Ver en IMDB
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowActor;