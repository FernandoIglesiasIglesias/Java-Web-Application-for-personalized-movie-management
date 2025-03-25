import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import "./ShowDirector.css"; // Crearemos este archivo de estilos similar a ShowActor.css

const apiCache = {
  idByName: {},
  directorDetails: {},
  movieDetails: {}
};

const ShowDirector = () => {
  const { directorName } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Estados para manejar datos y UI
  const [director, setDirector] = useState(null);
  const [knownForMovies, setKnownForMovies] = useState([]);
  const [detailedMovies, setDetailedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState("init");
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingDetailedMovies, setLoadingDetailedMovies] = useState(false);
  const [error, setError] = useState(null);
  const [moviesError, setMoviesError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Función para obtener el ID del director por nombre - con caché
  const getDirectorId = useCallback(async (name) => {
    // Comprobar si ya tenemos este ID en caché
    if (apiCache.idByName[name]) {
      console.log("Usando ID de director desde caché");
      return apiCache.idByName[name];
    }
    
    setLoadingStage("id");
    
    const idResponse = await fetch(
      `https://moviesminidatabase.p.rapidapi.com/director/imdb_id_byName/${encodeURIComponent(name)}/`,
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
      throw new Error("No se encontró información para este director.");
    }
    
    // Guardar en caché
    const directorId = idData.results[0].imdb_id;
    apiCache.idByName[name] = directorId;
    
    return directorId;
  }, []);

  // Función para obtener detalles del director - con caché
  const getDirectorDetails = useCallback(async (directorId) => {
    // Comprobar si ya tenemos estos detalles en caché
    if (apiCache.directorDetails[directorId]) {
      console.log("Usando detalles de director desde caché");
      return apiCache.directorDetails[directorId];
    }
    
    setLoadingStage("details");
    
    // Implementar reintentos para solicitudes fallidas
    let retries = 2;
    let detailsResponse;
    
    while (retries >= 0) {
      try {
        detailsResponse = await fetch(
          `https://moviesminidatabase.p.rapidapi.com/director/id/${directorId}/`,
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
      throw new Error("No se pudieron obtener los detalles del director.");
    }
    
    const results = detailsData.results;
    
    // Procesar los datos del director para nuestro formato
    const formattedDirector = {
      id: directorId,
      imdbId: directorId,
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
    apiCache.directorDetails[directorId] = formattedDirector;
    
    // Actualizar información en nuestra base de datos
    updateDirectorInDatabase(formattedDirector);
    
    return formattedDirector;
  }, []);

  // Función para actualizar el director en la base de datos
  const updateDirectorInDatabase = useCallback((directorData) => {
    if (!directorData.firstName || !directorData.lastName) {
      console.warn("No se puede actualizar el director sin nombre completo:", directorData);
      return;
    }

    const dbDirectorData = {
      firstName: directorData.firstName,
      lastName: directorData.lastName,
      imdbId: directorData.imdbId,
      tmdbId: directorData.tmdbId || '',
      birthDate: directorData.birth_date || null,
      birthPlace: directorData.birth_place || '',
      bio: directorData.bio || '',
      imageUrl: directorData.image_url || ''
    };

    // Realizar la petición PUT a nuestro backend
    fetch(`/directors/name/${encodeURIComponent(directorData.firstName)}/${encodeURIComponent(directorData.lastName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(dbDirectorData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(result => {
      console.log("Director actualizado en la base de datos:", result);
    })
    .catch(error => {
      console.error("Error actualizando director en la base de datos:", error);
    });
  }, []);

  // Función para obtener películas en las que ha trabajado el director
  const getKnownForMovies = useCallback(async (directorId) => {
    const knownForResponse = await fetch(
      `https://moviesminidatabase.p.rapidapi.com/director/id/${directorId}/movies_knownFor/`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
          "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
        },
      }
    );
    
    if (!knownForResponse.ok) {
      throw new Error(`Error en la API: ${knownForResponse.status}`);
    }
    
    const knownForData = await knownForResponse.json();
    
    if (!knownForData.results || knownForData.results.length === 0) {
      return [];
    }
    
    // Formatear datos de películas
    return knownForData.results.map(movie => ({
      imdbId: movie.imdb_id,
      title: movie.title,
      year: movie.year,
      rating: parseFloat(movie.rating) || 0
    }));
  }, []);

  // Función para obtener detalles de una película
  const getMovieDetails = useCallback(async (imdbId) => {
    // Usar caché si está disponible
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

  // Función principal para obtener todos los datos del director
  const fetchDirectorDetails = useCallback(async () => {
    setLoading(true);
    setLoadingStage("init");
    
    try {
      // Obtener ID e información en secuencia
      const directorId = await getDirectorId(directorName);
      const directorDetails = await getDirectorDetails(directorId);
      
      setDirector(directorDetails);
      setLoading(false);
      
      // Una vez que tengamos los detalles básicos, cargar las películas conocidas
      setLoadingMovies(true);
      try {
        const movies = await getKnownForMovies(directorId);
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
      console.error("Error al cargar detalles del director:", err);
      setError(err);
      setLoading(false);
    }
  }, [directorName, getDirectorId, getDirectorDetails, getKnownForMovies, loadDetailedMovieInfo]);

  // Efecto para cargar datos inicialmente
  useEffect(() => {
    if (directorName) {
      fetchDirectorDetails();
    }
  }, [directorName, fetchDirectorDetails]);

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
    fetchDirectorDetails();
  };

  // Renderizar estado de error
  if (error) {
    return (
      <div className={`director-error-container ${theme}`}>
        <div className="director-error-content">
          <div className="director-error-icon">❌</div>
          <h2>Ha ocurrido un error</h2>
          <p>{error.message || "No se pudo cargar la información del director"}</p>
          <div className="error-actions">
            <button 
              className={`director-button primary ${theme}`}
              onClick={handleRetryClick}
            >
              Reintentar
            </button>
            <button 
              className={`director-button secondary ${theme}`}
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
      <div className={`director-loading-container ${theme}`}>
        <div className="loading-spinner director-spinner"></div>
        <p className="loading-text">
          {loadingStage === "init" && "Iniciando búsqueda..."}
          {loadingStage === "id" && "Buscando información del director..."}
          {loadingStage === "details" && "Cargando detalles del director..."}
        </p>
        <p className="loading-progress">
          {loadingStage === "id" ? "Paso 1/2" : loadingStage === "details" ? "Paso 2/2" : "Preparando..."}
        </p>
        
        {/* Skeleton loader para dar sensación de carga más rápida */}
        <div className="director-skeleton">
          <div className="director-skeleton-header"></div>
          <div className="director-skeleton-content">
            <div className="director-skeleton-image"></div>
            <div className="director-skeleton-info">
              <div className="director-skeleton-title"></div>
              <div className="director-skeleton-meta"></div>
              <div className="director-skeleton-meta"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`director-detail-page ${theme}`}>
      <div className="director-detail-nav">
        <button 
          className={`back-button ${theme}`}
          onClick={handleBackClick}
          aria-label="Volver atrás"
        >
          ← Volver
        </button>
      </div>
      
      <div className="director-detail-container">
        <div className="director-header">
          <div className="director-image-container">
            {!imageError && director.image_url ? (
              <img 
                src={director.image_url} 
                alt={director.name} 
                className="director-image"
                onError={handleImageError}
              />
            ) : (
              <div className="director-image-placeholder">
                <span>{director.firstName?.charAt(0) || ''}{director.lastName?.charAt(0) || '?'}</span>
              </div>
            )}
          </div>
          
          <div className="director-info">
            <h1 className="director-name">{director.name}</h1>
            
            <div className="director-meta">
              {director.birth_date && (
                <div className="meta-item">
                  <span className="meta-label">Fecha de nacimiento:</span>
                  <span className="meta-value">{director.birth_date}</span>
                </div>
              )}
              
              {director.birth_place && (
                <div className="meta-item">
                  <span className="meta-label">Lugar de nacimiento:</span>
                  <span className="meta-value">{director.birth_place}</span>
                </div>
              )}
              
              {director.star_sign && (
                <div className="meta-item">
                  <span className="meta-label">Signo zodiacal:</span>
                  <span className="meta-value">{director.star_sign}</span>
                </div>
              )}
              
              {director.height && (
                <div className="meta-item">
                  <span className="meta-label">Altura:</span>
                  <span className="meta-value">{director.height}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {director.partial_bio && (
          <div className="director-bio-section">
            <h2>Biografía</h2>
            <p className="director-bio">{director.partial_bio}</p>
          </div>
        )}
        
        <div className="director-movies-section">
          <h2>Películas destacadas</h2>
          
          {loadingMovies ? (
            <div className="movies-loading">
              <div className="loading-spinner movies-spinner-small"></div>
              <p>Cargando películas...</p>
            </div>
          ) : moviesError ? (
            <div className="movies-error">
              <p>No se pudieron cargar las películas. {moviesError.message}</p>
            </div>
          ) : knownForMovies.length === 0 ? (
            <p className="no-movies">No hay información disponible sobre películas dirigidas por {director.name}.</p>
          ) : (
            <div className="movies-grid">
              {loadingDetailedMovies ? (
                // Mostrar placeholders mientras se cargan los detalles
                Array.from({ length: Math.min(6, knownForMovies.length) }).map((_, index) => (
                  <div key={index} className="movie-card-skeleton">
                    <div className="movie-poster-skeleton"></div>
                    <div className="movie-title-skeleton"></div>
                    <div className="movie-meta-skeleton"></div>
                  </div>
                ))
              ) : (
                // Mostrar tarjetas de películas con detalles completos
                detailedMovies.map((movie) => (
                  <div 
                    key={movie.imdbId} 
                    className="movie-card"
                    onClick={() => navigate(`/movies/${movie.imdbId}`)}
                  >
                    {movie.image_url ? (
                      <img 
                        src={movie.image_url} 
                        alt={movie.title} 
                        className="movie-poster"
                        loading="lazy"
                      />
                    ) : (
                      <div className="movie-poster-placeholder">
                        <span>{movie.title.charAt(0)}</span>
                      </div>
                    )}
                    
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.title}</h3>
                      <div className="movie-meta">
                        {movie.year && <span className="movie-year">{movie.year}</span>}
                        {movie.rating && (
                          <span className="movie-rating">
                            <span className="star-icon">★</span>
                            {movie.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="movie-genres">
                          {movie.genres.slice(0, 2).map((genre, index) => (
                            <span key={index} className="genre-pill">{genre}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowDirector;