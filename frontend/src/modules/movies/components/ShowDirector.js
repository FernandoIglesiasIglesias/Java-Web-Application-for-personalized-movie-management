import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { updateDirectorByName, getDirectorByName } from '../../../backend/directorService';
import './ShowDirector.css';
import AddDirectorToListModal from "../../list/components/AddDirectorToListModal";

// Flag global para indicar si la API está caída
let isApiUnavailable = false;
// Timestamp de cuando se detectó la última caída de la API
let apiDownSince = null;
// Tiempo de espera antes de reintentar (4 horas en milisegundos)
const API_RETRY_DELAY = 4 * 60 * 60 * 1000;

// Cache mejorado con almacenamiento persistente
const enhancedCache = {
  idByName: {},
  directorDetails: {},
  apiStatus: {
    isDown: false,
    downSince: null
  },
  
  // Cargar datos desde localStorage en la inicialización
  initialize() {
    try {
      // Cargar estado de la API
      const apiStatusStr = localStorage.getItem('directorApiStatus');
      if (apiStatusStr) {
        const apiStatus = JSON.parse(apiStatusStr);
        if (apiStatus.isDown) {
          isApiUnavailable = true;
          apiDownSince = apiStatus.downSince;
          this.apiStatus = apiStatus;
          
          // Verificar si ha pasado suficiente tiempo para reintentar
          if (apiDownSince && Date.now() - apiDownSince > API_RETRY_DELAY) {
            console.log("Han pasado más de 4 horas desde la última caída de la API, reintentar conexión");
            isApiUnavailable = false;
            apiDownSince = null;
            this.apiStatus = { isDown: false, downSince: null };
            this.saveApiStatus();
          }
        }
      }
      
      // Cargar caché normal
      const savedCache = localStorage.getItem('directorCache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        // Verificar si el caché no ha expirado (1 día o 7 días si API está caída)
        const expiryTime = isApiUnavailable ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        if (parsedCache.timestamp && (Date.now() - parsedCache.timestamp < expiryTime)) {
          this.idByName = parsedCache.idByName || {};
          this.directorDetails = parsedCache.directorDetails || {};
        }
      }
    } catch (e) {
      console.warn('Error cargando caché de director desde localStorage', e);
    }
  },
  
  // Guardar caché en localStorage
  saveToStorage() {
    try {
      localStorage.setItem('directorCache', JSON.stringify({
        idByName: this.idByName,
        directorDetails: this.directorDetails,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Error guardando caché de director en localStorage', e);
    }
  },
  
  // Guardar estado de la API
  saveApiStatus() {
    try {
      localStorage.setItem('directorApiStatus', JSON.stringify({
        isDown: isApiUnavailable,
        downSince: apiDownSince
      }));
    } catch (e) {
      console.warn('Error guardando estado de API en localStorage', e);
    }
  },
  
  // Marcar la API como caída
  markApiAsDown() {
    isApiUnavailable = true;
    apiDownSince = Date.now();
    this.apiStatus = {
      isDown: true,
      downSince: apiDownSince
    };
    this.saveApiStatus();
  },
  
  // Añadir ID al caché
  addId(name, id) {
    this.idByName[name] = id;
    this.saveToStorage();
    return id;
  },
  
  // Añadir detalles al caché con tiempo de expiración más largo si API está caída
  addDetails(id, details) {
    this.directorDetails[id] = details;
    this.saveToStorage();
    return details;
  }
};

// Inicializar caché desde localStorage
enhancedCache.initialize();

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
const ShowDirector = () => {
  const { directorName } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Estados para gestionar datos y UI
  const [director, setDirector] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('init');
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Función para obtener ID del director - con caché mejorada
  const getDirectorId = useCallback(async (name) => {
    // Si la API está caída y tenemos el nombre, usar ese nombre como identificador temporal
    if (isApiUnavailable) {
      console.log("API está caída, usando nombre como identificador temporal");
      return `name_${name.replace(/\s+/g, '_').toLowerCase()}`;
    }
    
    // Intentar caché primero
    if (enhancedCache.idByName[name]) {
      console.log("Usando ID de director desde caché");
      return enhancedCache.idByName[name];
    }
    
    setLoadingStage("id");
    
    try {
      // Intentar obtener desde backend primero (nuestra base de datos)
      try {
        const localDirector = await new Promise((resolve, reject) => {
          // Usar parámetro de consulta en lugar de ruta de URL
          getDirectorByName(
            name,
            (director) => resolve(director),
            (error) => reject(error)
          );
        });
        
        if (localDirector && localDirector.imdbId) {
          console.log("Director encontrado en base de datos local");
          return enhancedCache.addId(name, localDirector.imdbId);
        }
      } catch (localError) {
        console.log("No se encontró director en base de datos local:", localError);
      }
      
      // Si no está en nuestra DB, intentar API externa
      const idResponse = await fetch(
        `https://moviesminidatabase.p.rapidapi.com/actor/imdb_id_byName/${encodeURIComponent(name)}/`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
            "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
          },
          // Añadir timeout para petición
          signal: AbortSignal.timeout(5000)
        }
      );
      
      const responseText = await idResponse.text();
      let idData;
      
      try {
        idData = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parseando respuesta JSON:", e);
        throw new Error("Formato de respuesta de API inválido");
      }
      
      // Detectar mensaje específico de API no disponible
      if (idData.messages && idData.messages.includes("API is unreachable")) {
        console.error("API moviesminidatabase no está disponible:", idData);
        enhancedCache.markApiAsDown();
        
        // Crear un identificador basado en el nombre
        return `name_${name.replace(/\s+/g, '_').toLowerCase()}`;
      }
      
      if (!idData.results || idData.results.length === 0) {
        throw new Error("No se encontró información para este director.");
      }
      
      // Cache the ID and return
      const directorId = idData.results[0].imdb_id;
      return enhancedCache.addId(name, directorId);
    } catch (error) {
      console.error("Error buscando ID del director:", error);
      
      // Si es un error de timeout, marcar API como caída
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        enhancedCache.markApiAsDown();
        return `name_${name.replace(/\s+/g, '_').toLowerCase()}`;
      }
      
      throw error;
    }
  }, []);

  // Función optimizada para obtener detalles del director
  const getDirectorDetails = useCallback(async (directorId) => {
    // Intentar caché primero
    if (enhancedCache.directorDetails[directorId]) {
      console.log("Usando detalles de director desde caché");
      return enhancedCache.directorDetails[directorId];
    }
    
    // Si la API está marcada como caída, crear datos básicos desde el nombre
    if (isApiUnavailable) {
      console.log("API está caída, creando objeto fallback");
      const fallbackDirector = {
        id: directorId,
        imdbId: directorId.startsWith('name_') ? null : directorId,
        name: directorName,
        image_url: null,
        birth_date: null,
        birth_place: null,
        star_sign: null,
        height: null,
        partial_bio: "Información limitada disponible. El servicio externo de datos no está disponible temporalmente.",
        bio: null,
        apiUnavailable: true
      };
      
      return enhancedCache.addDetails(directorId, fallbackDirector);
    }
    
    setLoadingStage("details");
    
    // Intentar obtener desde backend primero (nuestra base de datos)
    try {
      const directorInfo = await new Promise((resolve, reject) => {
        if (directorId.startsWith('name_')) {
          getDirectorByName(
            directorName,
            (director) => resolve(director),
            (error) => reject(error)
          );
        } else {
          reject(new Error("No se encontró en base de datos local"));
        }
      });
      
      if (directorInfo) {
        console.log("Información del director encontrada en base de datos local");
        const formattedDirector = {
          id: directorInfo.id,
          imdbId: directorInfo.imdbId || directorId,
          name: directorInfo.name || directorName,
          image_url: directorInfo.imageUrl,
          birth_date: directorInfo.birthDate,
          birth_place: directorInfo.birthPlace,
          star_sign: directorInfo.starSign,
          height: directorInfo.height,
          partial_bio: directorInfo.bio,
          bio: directorInfo.bio,
          fromLocalDb: true
        };
        
        return enhancedCache.addDetails(directorId, formattedDirector);
      }
    } catch (localError) {
      console.log("No se encontraron detalles en base de datos local:", localError);
    }
    
    // Lógica de reintentos optimizada con tiempos de espera más cortos
    let retries = 1;
    let detailsResponse;
    
    try {
      detailsResponse = await fetch(
        `https://moviesminidatabase.p.rapidapi.com/actor/id/${directorId}/`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
            "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
          },
          // Añadir timeout para evitar esperas indefinidas
          signal: AbortSignal.timeout(5000)
        }
      );
      
      const detailsText = await detailsResponse.text();
      let detailsData;
      
      try {
        detailsData = JSON.parse(detailsText);
      } catch (e) {
        console.error("Error parseando respuesta:", e);
        throw new Error("Error en el formato de respuesta de la API");
      }
      
      // Verifica el mensaje específico de API no disponible
      if (detailsData.messages && detailsData.messages.includes("API is unreachable")) {
        console.error("API moviesminidatabase no está disponible:", detailsData);
        enhancedCache.markApiAsDown();
        
        // Crear un objeto con datos mínimos basados en información ya disponible
        const fallbackDirector = {
          id: directorId,
          imdbId: directorId,
          name: directorName,
          image_url: null,
          birth_date: null,
          birth_place: null,
          star_sign: null,
          height: null,
          partial_bio: "No se puede acceder a la información completa en este momento debido a problemas con el servicio externo de datos.",
          bio: null,
          apiUnavailable: true
        };
        
        // Guardar en caché con mayor duración
        return enhancedCache.addDetails(directorId, fallbackDirector);
      }
      
      if (!detailsData.results || Object.keys(detailsData.results).length === 0) {
        throw new Error("No se pudieron obtener los detalles del director.");
      }
      
      const results = detailsData.results;
      
      // Procesar los datos del director de manera más eficiente
      const formattedDirector = {
        id: directorId,
        imdbId: directorId,
        name: results.name && results.surname ? `${results.name} ${results.surname}`.trim() : results.name || '',
        image_url: results.image_url,
        birth_date: results.birth_date,
        birth_place: results.birth_place,
        star_sign: results.star_sign,
        height: results.height,
        partial_bio: results.partial_bio || results.bio,
        bio: results.bio || results.partial_bio || '',
        tmdbId: results.tmdb_id || ''
      };
      
      // Actualizar base de datos en segundo plano sin esperar
      setTimeout(() => updateDirectorInDatabase(formattedDirector), 0);
      
      // Cache and return
      return enhancedCache.addDetails(directorId, formattedDirector);
    } catch (err) {
      console.error("Error obteniendo detalles del director:", err);
      
      // Si es un error de timeout, marcar API como caída
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        enhancedCache.markApiAsDown();
        
        // Crear un objeto con información limitada si hay error
        const errorDirector = {
          id: directorId,
          imdbId: directorId,
          name: directorName,
          apiUnavailable: true,
          partial_bio: "No se puede acceder a la información completa en este momento debido a problemas con el servicio externo de datos."
        };
        
        return enhancedCache.addDetails(directorId, errorDirector);
      }
      
      throw err;
    }
  }, [directorName]);

  // Función para actualizar el director en la base de datos
  const updateDirectorInDatabase = useCallback((directorData) => {
    if (!directorData.name) {
      console.warn("No se puede actualizar el director sin nombre completo:", directorData);
      return;
    }

    const dbDirectorData = {
      name: directorData.name,
      firstName: directorData.name.split(' ')[0] || '',  // Añadido para resolver error de firstName nulo
      imdbId: directorData.imdbId,
      tmdbId: directorData.tmdbId || '',
      birthDate: directorData.birth_date || null,
      birthPlace: directorData.birth_place || '',
      starSign: directorData.star_sign || '',
      height: directorData.height || '',
      bio: directorData.bio || '',
      imageUrl: directorData.image_url || ''
    };

    updateDirectorByName(
      directorData.name,
      dbDirectorData,
      (result) => {
        console.log("Director actualizado en la base de datos:", result);
      },
      (error) => {
        console.error("Error actualizando director en la base de datos:", error);
      }
    );
  }, []);

  // Función optimizada para obtener detalles del director
  const fetchDirectorDetails = useCallback(async () => {
    setLoading(true);
    setLoadingStage("init");
    
    try {
      // Actualización temprana de la UI - mostrar skeleton loader inmediatamente
      setTimeout(() => {
        if (loading) setLoadingStage("id");
      }, 100);
      
      // Intentar obtener información básica del director desde la base de datos local primero
      try {
        // Si ya tenemos el director en DB local, usamos esa info inmediatamente
        const localDirector = await new Promise((resolve, reject) => {
          getDirectorByName(
            directorName,
            (director) => resolve(director),
            (error) => reject(error)
          );
        });
        
        if (localDirector) {
          const formattedDirector = {
            id: localDirector.id,
            imdbId: localDirector.imdbId,
            name: localDirector.name || directorName,
            image_url: localDirector.imageUrl,
            birth_date: localDirector.birthDate,
            birth_place: localDirector.birthPlace,
            star_sign: localDirector.starSign,
            height: localDirector.height,
            partial_bio: localDirector.bio,
            bio: localDirector.bio,
            fromLocalDb: true
          };
          
          setDirector(formattedDirector);
          setLoading(false);
          
          // Si la API está caída, mostrar advertencia
          if (isApiUnavailable) {
            setUsingFallback(true);
            setWarning({
              message: "Mostrando datos almacenados localmente. El servicio externo de datos no está disponible."
            });
            return;
          }
        }
      } catch (localDbError) {
        console.log("No se encontró director en base de datos local:", localDbError);
      }
      
      // Primero verificar si ya tenemos detalles completos en el caché por nombre
      if (enhancedCache.idByName[directorName] && 
          enhancedCache.directorDetails[enhancedCache.idByName[directorName]]) {
        const cachedDetails = enhancedCache.directorDetails[enhancedCache.idByName[directorName]];
        setDirector(cachedDetails);
        setLoading(false);
        
        // Si la API estaba caída la última vez, mostramos un mensaje al usuario
        if (cachedDetails.apiUnavailable) {
          setWarning({
            message: "Mostrando información limitada. El servicio externo de datos no está disponible en este momento."
          });
          setUsingFallback(true);
        }
        
        // En segundo plano, verificar si la API ya está disponible de nuevo y actualizar datos
        if (isApiUnavailable && (Date.now() - apiDownSince > API_RETRY_DELAY)) {
          console.log("Verificando si la API ya está disponible...");
          try {
            const probe = await fetch(
              "https://moviesminidatabase.p.rapidapi.com/counter/",
              {
                method: "GET",
                headers: {
                  "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
                  "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
                },
                signal: AbortSignal.timeout(3000)
              }
            );
            
            if (probe.ok) {
              console.log("La API está disponible nuevamente");
              isApiUnavailable = false;
              apiDownSince = null;
              enhancedCache.apiStatus.isDown = false;
              enhancedCache.apiStatus.downSince = null;
              enhancedCache.saveApiStatus();
              
              // No refrescar automáticamente para evitar experiencia incómoda al usuario
            }
          } catch (e) {
            console.log("La API sigue caída:", e);
          }
        }
        
        return;
      }
      
      try {
        // Intentamos obtener el ID y detalles
        const directorId = await getDirectorId(directorName);
        const directorDetails = await getDirectorDetails(directorId);
        
        setDirector(directorDetails);
        setLoading(false);
        
        // Si detectamos que la API está caída
        if (directorDetails.apiUnavailable) {
          setWarning({
            message: "Mostrando información limitada. El servicio externo de datos no está disponible en este momento."
          });
          setUsingFallback(true);
        }
      } catch (apiError) {
        if (isApiUnavailable) {
          // Si la API está caída y no pudimos obtener nada, mostrar objeto mínimo
          const fallbackDirector = {
            name: directorName,
            partial_bio: "No se puede acceder a la información completa en este momento."
          };
          
          setDirector(fallbackDirector);
          setLoading(false);
          setUsingFallback(true);
          setWarning({
            message: "El servicio externo de datos de directores no está disponible actualmente. Mostrando información limitada."
          });
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Error cargando detalles del director:", err);
      setError(err);
      setLoading(false);
    }
  }, [directorName, getDirectorId, getDirectorDetails, loading]);

  // Efecto para cargar datos inicialmente
  useEffect(() => {
    if (directorName) {
      fetchDirectorDetails();
    }
    
    return () => {
      // Limpieza al desmontar el componente
      setDirector({});
      setError(null);
      setWarning(null);
    };
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
    setWarning(null);
    setImageError(false);
    setUsingFallback(false);
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
              <div className="director-skeleton-bio"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="director-detail-page">
      {/* Banner de advertencia si estamos usando datos limitados */}
      {warning && (
        <div className={`director-warning-banner ${theme}`}>
          <span className="warning-icon">⚠️</span>
          <p>{warning.message}</p>
          <button 
            className="close-warning-button"
            onClick={() => setWarning(null)}
            aria-label="Cerrar advertencia"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Fondo con imagen de director desenfocada para dar profundidad */}
      {director.image_url && !imageError && (
        <div 
          className="director-backdrop" 
          style={{ backgroundImage: `url(${director.image_url})` }}
        >
          <div className={`backdrop-overlay ${theme}`}></div>
        </div>
      )}
      
      <div className={`director-detail-container ${theme}`}>
        {/* Cabecera con botón para volver atrás */}
        <div className="director-detail-nav">
          <button 
            className={`back-button ${theme}`}
            onClick={handleBackClick}
            aria-label="Volver atrás"
          >
            ← Volver
          </button>
        </div>
        
        <div className="director-detail-content">
          {/* Foto del director */}
          <div className="director-details-poster-container">
            {director.image_url && !imageError ? (
              <img
                src={director.image_url}
                alt={director.name || "Foto del director"}
                className="director-poster-image"
                onError={handleImageError}
              />
            ) : (
              <div className="director-poster-placeholder">
                <span>{director.name ? getInitials(director.name) : "No disponible"}</span>
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
          <div className="director-info-container">
            <div className="director-header-info">
              <h1 className="director-title">{director.name || "Nombre no disponible"}</h1>
              
              <div className="director-meta">
                {director.birth_date && <span className="director-birth-date">{director.birth_date}</span>}
                {director.birth_place && <span className="director-birth-place">{director.birth_place}</span>}
                {director.star_sign && (
                  <span className="director-star-sign">
                    <span className="star-icon">♈</span> 
                    {director.star_sign}
                  </span>
                )}
              </div>
            </div>
            
            {director.partial_bio && (
              <div className="director-section">
                <h2>Biografía</h2>
                <p className="director-overview">{director.partial_bio}</p>
              </div>
            )}
            
            <div className="director-section">
              <h2>Detalles</h2>
              <div className="director-details-grid">
                {director.birth_date && (
                  <div className="detail-item">
                    <h3>Fecha de nacimiento</h3>
                    <p>{director.birth_date}</p>
                  </div>
                )}
                {director.birth_place && (
                  <div className="detail-item">
                    <h3>Lugar de nacimiento</h3>
                    <p>{director.birth_place}</p>
                  </div>
                )}
                {director.star_sign && (
                  <div className="detail-item">
                    <h3>Signo del zodiaco</h3>
                    <p>{director.star_sign}</p>
                  </div>
                )}
                {director.height && (
                  <div className="detail-item">
                    <h3>Altura</h3>
                    <p>{director.height}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pie de página con información adicional */}
      <div className="director-footer">
        <div className={`director-footer-content ${theme}`}>
          <p className="director-disclaimer">
            Información proporcionada por bases de datos de películas externas.
            {usingFallback && " Mostrando datos limitados debido a problemas de conexión."}
          </p>
          <p className="director-imdb-link">
            {director.imdbId && !director.imdbId.startsWith('name_') && (
              <a 
                href={`https://www.imdb.com/name/${director.imdbId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={`imdb-button ${theme}`}
              >
                Ver en IMDB
              </a>
            )}
            
            {!usingFallback && (
              <button 
                className={`refresh-button ${theme}`}
                onClick={handleRetryClick}
                title="Refrescar datos"
              >
                <span className="refresh-icon">↻</span> Actualizar
              </button>
            )}
          </p>
        </div>
      </div>

      {showAddToListModal && (
        <AddDirectorToListModal
          director={director}
          onClose={() => setShowAddToListModal(false)}
        />
      )}
    </div>
  );
};

export default ShowDirector;