import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserLists, createList } from "../../../backend/listService";
import { getUserActorLists, createActorList } from "../../../backend/actorListService";
import { getUserDirectorLists, createDirectorList } from "../../../backend/directorListService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./UserLists.css";

const UserLists = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Separate states for different list types
  const [movieLists, setMovieLists] = useState([]);
  const [actorLists, setActorLists] = useState([]);
  const [directorLists, setDirectorLists] = useState([]);
  
  const [newListName, setNewListName] = useState("");
  const [listType, setListType] = useState("movie"); // Default to movie lists
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el select personalizado
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef(null);

  // Get current user ID from session/auth context
  const userId = 1; // Replace with actual user ID from your auth system

  // Function to load movie lists
  const loadMovieLists = useCallback(() => {
    getUserLists(
      (fetchedLists) => {
        setMovieLists(fetchedLists);
      },
      (error) => {
        console.error("Error al cargar listas de películas:", error);
        if (error.globalError !== "project.exceptions.EmptyUserListsException") {
          setErrors(error);
        } else {
          setMovieLists([]);
        }
      }
    );
  }, []);

  // Function to load actor lists
  const loadActorLists = useCallback(() => {
    getUserActorLists(
      userId,
      (fetchedLists) => {
        setActorLists(fetchedLists);
      },
      (error) => {
        console.error("Error al cargar listas de actores:", error);
        if (error.globalError !== "project.exceptions.EmptyUserListsException") {
          setErrors(error);
        } else {
          setActorLists([]);
        }
      }
    );
  }, [userId]);

  // Function to load director lists
  const loadDirectorLists = useCallback(() => {
    getUserDirectorLists(
      userId,
      (fetchedLists) => {
        setDirectorLists(fetchedLists);
      },
      (error) => {
        console.error("Error al cargar listas de directores:", error);
        if (error.globalError !== "project.exceptions.EmptyUserListsException") {
          setErrors(error);
        } else {
          setDirectorLists([]);
        }
      }
    );
  }, [userId]);

  // Load all list types
  const loadAllLists = useCallback(() => {
    setLoading(true);
    
    Promise.all([
      new Promise(resolve => {
        loadMovieLists();
        resolve();
      }),
      new Promise(resolve => {
        loadActorLists();
        resolve();
      }),
      new Promise(resolve => {
        loadDirectorLists();
        resolve();
      })
    ]).then(() => {
      setLoading(false);
    });
  }, [loadMovieLists, loadActorLists, loadDirectorLists]);

  // Load lists when component mounts
  useEffect(() => {
    loadAllLists();
  }, [loadAllLists]);

  // Update lists when window gets focus
  useEffect(() => {
    const handleFocus = () => {
      loadAllLists();
    };

    window.addEventListener('focus', handleFocus);
    
    // Update when document becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAllLists();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadAllLists]);
  
  // Manejador para abrir/cerrar el selector
  const toggleSelect = () => {
    setIsSelectOpen(!isSelectOpen);
  };

  // Manejador para seleccionar una opción
  const handleSelectOption = (value) => {
    setListType(value);
    setIsSelectOpen(false);
  };

  // Manejador para cerrar el selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Opciones del select con iconos
  const listTypeOptions = [
    { value: 'movie', label: 'Lista de películas', icon: '🎬' },
    { value: 'actor', label: 'Lista de actores', icon: '🎭' },
    { value: 'director', label: 'Lista de directores', icon: '🎥' }
  ];

  // Obtener la etiqueta para el valor seleccionado
  const getSelectedLabel = () => {
    const option = listTypeOptions.find(opt => opt.value === listType);
    return option ? option.label : '';
  };

  // Handle form submission based on list type
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newListName.trim()) {
      setLoading(true);
      
      switch(listType) {
        case "movie":
          createList(
            newListName.trim(),
            () => {
              loadMovieLists();
              setNewListName("");
              setLoading(false);
            },
            (error) => {
              setErrors(error);
              setLoading(false);
            }
          );
          break;
          
        case "actor":
          createActorList(
            userId,
            newListName.trim(),
            () => {
              loadActorLists();
              setNewListName("");
              setLoading(false);
            },
            (error) => {
              setErrors(error);
              setLoading(false);
            }
          );
          break;
          
        case "director":
          createDirectorList(
            userId,
            newListName.trim(),
            () => {
              loadDirectorLists();
              setNewListName("");
              setLoading(false);
            },
            (error) => {
              setErrors(error);
              setLoading(false);
            }
          );
          break;
          
        default:
          setLoading(false);
      }
    }
  };

  // Navigate to the appropriate list detail page
  const handleListClick = (listId, type) => {
    switch(type) {
      case "movie":
        navigate(`/lists/${listId}`);
        break;
      case "actor":
        navigate(`/actor-lists/${listId}`);
        break;
      case "director":
        navigate(`/director-lists/${listId}`);
        break;
      default:
        break;
    }
  };

  // Render list cards for a specific type
  const renderListCards = (lists, type) => {
    if (lists.length === 0) {
      return (
        <div className="no-lists-container">
          <div className="no-lists-icon">📋</div>
          <p className="no-lists-message">No tienes listas de {type === "movie" ? "películas" : type === "actor" ? "actores" : "directores"} creadas.</p>
          <p className="no-lists-suggestion">
            Crea tu primera lista para empezar a guardar tus {type === "movie" ? "películas" : type === "actor" ? "actores" : "directores"} favoritos.
          </p>
        </div>
      );
    }

    return lists.map((list) => (
      <div
        key={list.id}
        className={`list-card ${theme}`}
        onClick={() => handleListClick(list.id, type)}
      >
        <div className="list-card-inner">
          <h3>{list.name}</h3>
          <div className="list-card-footer">
            {type === "movie" && (
              (list.movieCount > 0 || (list.movies && list.movies.length > 0)) ? (
                <span className="movie-count">
                  {list.movieCount !== undefined 
                    ? `${list.movieCount} película${list.movieCount !== 1 ? 's' : ''}` 
                    : `${list.movies.length} película${list.movies.length !== 1 ? 's' : ''}`
                  }
                </span>
              ) : (
                <span className="empty-list">Lista vacía</span>
              )
            )}
            {type === "actor" && (
              (list.actorCount > 0 || (list.actors && list.actors.length > 0)) ? (
                <span className="movie-count">
                  {list.actorCount !== undefined 
                    ? `${list.actorCount} actor${list.actorCount !== 1 ? 'es' : ''}` 
                    : `${list.actors.length} actor${list.actors.length !== 1 ? 'es' : ''}`
                  }
                </span>
              ) : (
                <span className="empty-list">Lista vacía</span>
              )
            )}
            {type === "director" && (
              (list.directorCount > 0 || (list.directors && list.directors.length > 0)) ? (
                <span className="movie-count">
                  {list.directorCount !== undefined 
                    ? `${list.directorCount} director${list.directorCount !== 1 ? 'es' : ''}` 
                    : `${list.directors.length} director${list.directors.length !== 1 ? 'es' : ''}`
                  }
                </span>
              ) : (
                <span className="empty-list">Lista vacía</span>
              )
            )}
            <span className="view-list">Ver lista →</span>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="user-lists-page">
      <div className={`lists-container ${theme}`}>
        <header className="lists-header">
          <h1>Mis Listas</h1>
          <p className="lists-description">
            Organiza tus películas, actores y directores favoritos en listas personalizadas
          </p>
        </header>
        
        {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}

        {/* Form to create a new list */}
        <div className="create-list-section">
          <h2>Crear nueva lista</h2>
          <form className="create-list-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nombre de la nueva lista"
                className={theme}
                disabled={loading}
              />
              
              <div className="select-container" ref={selectRef}>
                {/* Select visible que muestra la opción seleccionada */}
                <div 
                  className={`select-header ${isSelectOpen ? 'select-header-active' : ''} ${theme}`} 
                  onClick={toggleSelect}
                  tabIndex="0"
                  aria-expanded={isSelectOpen}
                  role="combobox"
                >
                  <div className="select-value">
                    <span className="select-option-icon">{listTypeOptions.find(opt => opt.value === listType)?.icon}</span>
                    {getSelectedLabel()}
                  </div>
                  <span className={`select-arrow ${isSelectOpen ? 'select-arrow-up' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {/* Overlay para cerrar al hacer clic fuera */}
                <div 
                  className={`select-overlay ${isSelectOpen ? 'select-overlay-active' : ''}`} 
                  onClick={() => setIsSelectOpen(false)}
                ></div>
                
                {/* Lista de opciones */}
                <div className={`select-options ${isSelectOpen ? 'select-options-active' : ''}`}>
                  {listTypeOptions.map(option => (
                    <div 
                      key={option.value}
                      className={`select-option ${listType === option.value ? 'select-option-selected' : ''}`} 
                      onClick={() => handleSelectOption(option.value)}
                      role="option"
                      aria-selected={listType === option.value}
                    >
                      <span className="select-option-icon">{option.icon}</span>
                      {option.label}
                      <span className="select-option-check">✓</span>
                    </div>
                  ))}
                </div>
                
                {/* Select nativo como fallback para accesibilidad */}
                <select
                  value={listType}
                  onChange={(e) => setListType(e.target.value)}
                  disabled={loading}
                  aria-hidden="true"
                >
                  {listTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                type="submit" 
                className={`list-button primary ${theme}`}
                disabled={loading || !newListName.trim()}
              >
                {loading ? "Creando..." : "Crear lista"}
              </button>
            </div>
          </form>
        </div>

        {/* Movie lists section */}
        <div className="lists-content">
          <h2>Mis listas de películas</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-message">Cargando tus listas...</p>
            </div>
          ) : (
            renderListCards(movieLists, "movie")
          )}
        </div>

        {/* Actor lists section */}
        <div className="lists-content">
          <h2>Mis listas de actores</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-message">Cargando tus listas...</p>
            </div>
          ) : (
            renderListCards(actorLists, "actor")
          )}
        </div>

        {/* Director lists section */}
        <div className="lists-content">
          <h2>Mis listas de directores</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-message">Cargando tus listas...</p>
            </div>
          ) : (
            renderListCards(directorLists, "director")
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLists;