import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { updateActorByName, getActorByName } from '../../../backend/actorService';
import './ShowActor.css';
import AddActorToListModal from "../../list/components/AddActorToListModal";

// Flag global para indicar si la API está caída
let isApiUnavailable = false;
// Timestamp de cuando se detectó la última caída de la API
let apiDownSince = null;
// Tiempo de espera antes de reintentar (4 horas en milisegundos)
const API_RETRY_DELAY = 4 * 60 * 60 * 1000;

// Cache mejorado con almacenamiento persistente
const enhancedCache = {
  idByName: {},
  actorDetails: {},
  apiStatus: {
    isDown: false,
    downSince: null
  },
  
  // Cargar datos desde localStorage en la inicialización
  initialize() {
    try {
      // Cargar estado de la API
      const apiStatusStr = localStorage.getItem('apiStatus');
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
      const savedCache = localStorage.getItem('actorCache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        // Tiempo de caché normal: 1 día, extendido: 7 días si API está caída
        const cacheDuration = this.apiStatus.isDown ? 7 * 86400000 : 86400000;
        
        if (parsedCache.timestamp && (Date.now() - parsedCache.timestamp < cacheDuration)) {
          this.idByName = parsedCache.idByName || {};
          this.actorDetails = parsedCache.actorDetails || {};
        }
      }
    } catch (e) {
      console.warn('Error cargando caché de actor desde localStorage', e);
    }
  },
  
  // Guardar caché en localStorage
  saveToStorage() {
    try {
      localStorage.setItem('actorCache', JSON.stringify({
        idByName: this.idByName,
        actorDetails: this.actorDetails,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Error guardando caché de actor en localStorage', e);
    }
  },
  
  // Guardar estado de la API
  saveApiStatus() {
    try {
      localStorage.setItem('apiStatus', JSON.stringify({
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
    this.actorDetails[id] = details;
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
const ShowActor = () => {
  const { actorName } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Estados para gestionar datos y UI
  const [actor, setActor] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('init');
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Función para obtener ID del actor - con caché mejorada
  const getActorId = useCallback(async (name) => {
    // Si la API está caída y tenemos el nombre, usar ese nombre como identificador temporal
    if (isApiUnavailable) {
      console.log("API está caída, usando nombre como identificador temporal");
      return `name_${name.replace(/\s+/g, '_').toLowerCase()}`;
    }
    
    // Intentar caché primero
    if (enhancedCache.idByName[name]) {
      console.log("Usando ID de actor desde caché");
      return enhancedCache.idByName[name];
    }
    
    setLoadingStage("id");
    
    try {
      // Intentar obtener desde backend primero (nuestra base de datos)
      try {
        const localActor = await new Promise((resolve, reject) => {
          getActorByName(
            name,
            (actor) => resolve(actor),
            (error) => reject(error)
          );
        });
        
        if (localActor && localActor.id) {
          console.log("Actor encontrado en base de datos local");
          return enhancedCache.addId(name, localActor.imdbId || `local_${localActor.id}`);
        }
      } catch (localError) {
        console.log("Actor no encontrado en base de datos local, intentando API externa");
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
        throw new Error("El servicio externo de información de actores no está disponible temporalmente");
      }
      
      if (!idData.results || idData.results.length === 0) {
        throw new Error("No se encontró información para este actor.");
      }
      
      // Guardar en caché y retornar
      const actorId = idData.results[0].imdb_id;
      return enhancedCache.addId(name, actorId);
    } catch (error) {
      console.error("Error buscando ID del actor:", error);
      
      // Si es un error de timeout, marcar API como caída
      if (error.name === 'TimeoutError') {
        enhancedCache.markApiAsDown();
        throw new Error("La API de búsqueda no responde. Usando información limitada.");
      }
      
      throw error;
    }
  }, []);

  // Función optimizada para obtener detalles del actor
  const getActorDetails = useCallback(async (actorId) => {
    // Intentar caché primero
    if (enhancedCache.actorDetails[actorId]) {
      console.log("Usando detalles de actor desde caché");
      return enhancedCache.actorDetails[actorId];
    }
    
    // Si la API está marcada como caída, crear datos básicos desde el nombre
    if (isApiUnavailable) {
      console.log("API está caída, creando objeto fallback");
      const fallbackActor = {
        id: actorId,
        imdbId: actorId.startsWith('name_') ? null : actorId,
        name: actorName,
        image_url: null,
        birth_date: null,
        birth_place: null,
        star_sign: null,
        height: null,
        partial_bio: "Información limitada disponible. El servicio externo de datos no está disponible temporalmente.",
        bio: null,
        apiUnavailable: true
      };
      
      return enhancedCache.addDetails(actorId, fallbackActor);
    }
    
    setLoadingStage("details");
    
    // Intentar obtener desde backend primero (nuestra base de datos)
    try {
      if (!actorId.startsWith('name_') && !actorId.startsWith('local_')) {
        const localActor = await new Promise((resolve, reject) => {
          getActorByName(
            actorName,
            (actor) => resolve(actor),
            (error) => reject(error)
          );
        });
        
        if (localActor && localActor.name) {
          console.log("Detalles de actor encontrados en base de datos local");
          const formattedLocalActor = {
            id: localActor.id,
            imdbId: localActor.imdbId,
            name: localActor.name,
            image_url: localActor.imageUrl,
            birth_date: localActor.birthDate,
            birth_place: localActor.birthPlace,
            star_sign: localActor.starSign,
            height: localActor.height,
            partial_bio: localActor.bio,
            bio: localActor.bio,
            fromLocalDB: true
          };
          
          return enhancedCache.addDetails(actorId, formattedLocalActor);
        }
      }
    } catch (localError) {
      console.log("Detalles de actor no encontrados en base de datos local, intentando API externa");
    }
    
    // Lógica de reintentos optimizada con tiempos de espera más cortos
    let retries = 1; 
    let detailsResponse;
    
    try {
      detailsResponse = await fetch(
        `https://moviesminidatabase.p.rapidapi.com/actor/id/${actorId}/`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "moviesminidatabase.p.rapidapi.com",
            "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
          },
          // Agregamos un timeout para no esperar indefinidamente
          signal: AbortSignal.timeout(5000)
        }
      );
      
      const responseText = await detailsResponse.text();
      let detailsData;
      
      try {
        detailsData = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parseando respuesta:", e);
        throw new Error("Error en el formato de respuesta de la API");
      }
      
      // Verifica el mensaje específico de API no disponible
      if (detailsData.messages && detailsData.messages.includes("API is unreachable")) {
        console.error("API moviesminidatabase no está disponible:", detailsData);
        enhancedCache.markApiAsDown();
        
        // Crear un objeto con datos mínimos basados en información ya disponible
        const fallbackActor = {
          id: actorId,
          imdbId: actorId,
          name: actorName,
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
        return enhancedCache.addDetails(actorId, fallbackActor);
      }
      
      if (!detailsData.results || Object.keys(detailsData.results).length === 0) {
        throw new Error("No se pudieron obtener los detalles del actor.");
      }
      
      // Procesar normalmente si todo va bien
      const results = detailsData.results;
      
      // Procesar los datos del actor de manera más eficiente
      const formattedActor = {
        id: actorId,
        imdbId: actorId,
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
      setTimeout(() => updateActorInDatabase(formattedActor), 0);
      
      // Guardar en caché y retornar
      return enhancedCache.addDetails(actorId, formattedActor);
    } catch (err) {
      console.error("Error obteniendo detalles del actor:", err);
      
      // Si es un error de timeout, marcar API como caída
      if (err.name === 'TimeoutError') {
        enhancedCache.markApiAsDown();
        
        // Crear un objeto con información limitada si hay error
        const errorActor = {
          id: actorId,
          imdbId: actorId,
          name: actorName,
          apiUnavailable: true,
          partial_bio: "No se puede acceder a la información completa en este momento debido a problemas con el servicio externo de datos."
        };
        
        return enhancedCache.addDetails(actorId, errorActor);
      }
      
      throw err;
    }
  }, [actorName]);

  // Función para actualizar el actor en la base de datos
  const updateActorInDatabase = useCallback((actorData) => {
    if (!actorData.name) {
      console.warn("No se puede actualizar el actor sin nombre completo:", actorData);
      return;
    }

    const dbActorData = {
      name: actorData.name,
      firstName: actorData.name.split(' ')[0] || '',  // Añadido para resolver error de firstName nulo
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
      actorData.name,
      dbActorData,
      (result) => {
        console.log("Actor actualizado en la base de datos:", result);
      },
      (error) => {
        console.error("Error actualizando actor en la base de datos:", error);
      }
    );
  }, []);

  // Función optimizada para obtener detalles del actor
  const fetchActorDetails = useCallback(async () => {
    setLoading(true);
    setLoadingStage("init");
    
    try {
      // Si la API está caída, intentar obtener datos de nuestra base de datos primero
      if (isApiUnavailable) {
        try {
          const localActor = await new Promise((resolve, reject) => {
            getActorByName(
              actorName,
              (actor) => resolve(actor),
              (error) => reject(error)
            );
          });
          
          if (localActor && localActor.name) {
            const formattedLocalActor = {
              id: localActor.id,
              imdbId: localActor.imdbId,
              name: localActor.name,
              image_url: localActor.imageUrl,
              birth_date: localActor.birthDate,
              birth_place: localActor.birthPlace,
              star_sign: localActor.starSign,
              height: localActor.height,
              partial_bio: localActor.bio,
              bio: localActor.bio,
              fromLocalDB: true
            };
            
            setActor(formattedLocalActor);
            setLoading(false);
            setUsingFallback(false);
            setWarning({
              message: "Mostrando datos almacenados localmente. El servicio externo de datos no está disponible."
            });
            return;
          }
        } catch (localDbError) {
          console.log("No se encontró actor en base de datos local:", localDbError);
        }
      }
      
      // Actualización temprana de la UI - mostrar skeleton loader inmediatamente
      setTimeout(() => {
        if (loading) setLoadingStage("id");
      }, 100);
      
      // Primero verificar si ya tenemos detalles completos en el caché por nombre
      if (enhancedCache.idByName[actorName] && 
          enhancedCache.actorDetails[enhancedCache.idByName[actorName]]) {
        const cachedDetails = enhancedCache.actorDetails[enhancedCache.idByName[actorName]];
        setActor(cachedDetails);
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
        const actorId = await getActorId(actorName);
        const actorDetails = await getActorDetails(actorId);
        
        setActor(actorDetails);
        setLoading(false);
        
        // Si detectamos que la API está caída
        if (actorDetails.apiUnavailable) {
          setWarning({
            message: "Mostrando información limitada. El servicio externo de datos no está disponible en este momento."
          });
          setUsingFallback(true);
        }
      } catch (apiError) {
        if (isApiUnavailable) {
          // Si la API está caída y no pudimos obtener nada, mostrar objeto mínimo
          const fallbackActor = {
            name: actorName,
            partial_bio: "No se puede acceder a la información completa en este momento."
          };
          
          setActor(fallbackActor);
          setLoading(false);
          setUsingFallback(true);
          setWarning({
            message: "El servicio externo de datos de actores no está disponible actualmente. Mostrando información limitada."
          });
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Error cargando detalles del actor:", err);
      setError(err);
      setLoading(false);
    }
  }, [actorName, getActorId, getActorDetails, loading]);

  // Efecto para cargar datos inicialmente
  useEffect(() => {
    if (actorName) {
      fetchActorDetails();
    }
    
    return () => {
      // Limpieza al desmontar el componente
      setActor({});
      setError(null);
      setWarning(null);
    };
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
    setWarning(null);
    setImageError(false);
    setUsingFallback(false);
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

  // Renderizar estado de carga
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
      </div>
    );
  }

  return (
    <div className="actor-detail-page">
      {/* Banner de advertencia si estamos usando datos limitados */}
      {warning && (
        <div className={`actor-warning-banner ${theme}`}>
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
          <div className="actor-details-poster-container">
            {actor.image_url && !imageError ? (
              <img
                src={actor.image_url}
                alt={actor.name || "Foto del actor"}
                className="actor-poster-image"
                onError={handleImageError}
              />
            ) : (
              <div className="actor-poster-placeholder">
                <span>{actor.name ? getInitials(actor.name) : "No disponible"}</span>
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
          <div className="actor-info-container">
            <div className="actor-header-info">
              <h1 className="actor-title">{actor.name || "Nombre no disponible"}</h1>
              
              <div className="actor-meta">
                {actor.birth_date && <span className="actor-birth-date">{actor.birth_date}</span>}
                {actor.birth_place && <span className="actor-birth-place">{actor.birth_place}</span>}
                {actor.star_sign && (
                  <span className="actor-star-sign">
                    <span className="star-icon">♈</span> 
                    {actor.star_sign}
                  </span>
                )}
              </div>
            </div>
            
            {actor.partial_bio && (
              <div className="actor-section">
                <h2>Biografía</h2>
                <p className="actor-overview">{actor.partial_bio}</p>
              </div>
            )}
            
            <div className="actor-section">
              <h2>Detalles</h2>
              <div className="actor-details-grid">
                {actor.birth_date && (
                  <div className="detail-item">
                    <h3>Fecha de nacimiento</h3>
                    <p>{actor.birth_date}</p>
                  </div>
                )}
                {actor.birth_place && (
                  <div className="detail-item">
                    <h3>Lugar de nacimiento</h3>
                    <p>{actor.birth_place}</p>
                  </div>
                )}
                {actor.star_sign && (
                  <div className="detail-item">
                    <h3>Signo del zodiaco</h3>
                    <p>{actor.star_sign}</p>
                  </div>
                )}
                {actor.height && (
                  <div className="detail-item">
                    <h3>Altura</h3>
                    <p>{actor.height}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pie de página con información adicional */}
      <div className="actor-footer">
        <div className={`actor-footer-content ${theme}`}>
          <p className="actor-disclaimer">
            Información proporcionada por bases de datos de películas externas.
            {usingFallback && " Mostrando datos limitados debido a problemas de conexión."}
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
        <AddActorToListModal
          actor={actor}
          onClose={() => setShowAddToListModal(false)}
        />
      )}
    </div>
  );
};

export default ShowActor;