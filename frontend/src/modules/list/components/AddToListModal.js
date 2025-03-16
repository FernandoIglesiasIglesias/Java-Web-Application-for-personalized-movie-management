import React, { useEffect, useState } from "react";
import { getUserLists, addMovieToList, createList, removeMovieFromList } from "../../../backend/listService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./AddToListModal.css";

const AddToListModal = ({ movie, onClose }) => {
  const { theme } = useTheme();
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState("");
  const [newListName, setNewListName] = useState("");
  const [showCreateList, setShowCreateList] = useState(false);
  const [errors, setErrors] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [successType, setSuccessType] = useState("add"); // Track success type: add or remove

  // Cargar todas las listas y marcar las que ya contienen la película
  const loadLists = () => {
    setLoading(true);
    getUserLists(
      (fetchedLists) => {
        // Para cada lista, determinar si ya contiene la película
        const processedLists = fetchedLists.map(list => {
          const movieExists = list.movies?.some(
            listMovie => listMovie.id === movie.id || listMovie.imbdId === movie.imbdId
          );
          return {
            ...list,
            containsMovie: movieExists
          };
        });
        
        setLists(processedLists);
        // Seleccionar la primera lista que no contiene la película como predeterminada
        const firstAvailableList = processedLists.find(list => !list.containsMovie);
        if (firstAvailableList) {
          setSelectedList(firstAvailableList.id);
        } else if (processedLists.length === 0) {
          setShowCreateList(true);
        }
        setLoading(false);
      },
      (error) => {
        if (error.globalError === "project.exceptions.EmptyUserListsException") {
          setShowCreateList(true);
        } else {
          setErrors(error);
        }
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    loadLists();
  }, [movie.id, movie.imbdId]);

  // Manejar la adición de la película a la lista seleccionada
  const handleAddToList = (listId) => {
    addMovieToList(
      listId,
      movie,
      () => {
        // Find and animate the list item
        const listItem = document.querySelector(`.list-item[data-id="${listId}"]`);
        if (listItem) {
          listItem.classList.add('adding');
          setTimeout(() => listItem.classList.remove('adding'), 600);
        }
        
        setAnimateSuccess(true);
        setSuccessMessage(`Película añadida a la lista correctamente.`);
        setSuccessType('add'); // Track success type
        loadLists();
        setTimeout(() => {
          setSuccessMessage("");
          setAnimateSuccess(false);
        }, 2000);
      },
      (error) => {
        setErrors(error);
      }
    );
  };

// Manejar la eliminación de la película de una lista
const handleRemoveFromList = (listId) => {
  // Find the list item first to animate it
  const listItem = document.querySelector(`.list-item[data-id="${listId}"]`);
  if (listItem) {
    listItem.classList.add('removing');
  }
  
  // First check if we have a numeric ID
  if (movie.id) {
    removeMovieFromList(
      listId,
      movie.id,
      () => {
        setAnimateSuccess(true);
        setSuccessMessage(`Película eliminada de la lista correctamente.`);
        setSuccessType('remove'); // Track success type
        loadLists();
        setTimeout(() => {
          setSuccessMessage("");
          setAnimateSuccess(false);
        }, 2000);
      },
      (error) => {
        setErrors(error);
      }
    );
  } else {
    // If we only have the IMDB ID, we need to find the movie in the list first
    const listWithMovie = lists.find(list => list.id === listId);
    const movieInList = listWithMovie?.movies?.find(
      m => m.imbdId === movie.imbdId || m.id === movie.imbdId
    );
    
    if (movieInList && movieInList.id) {
      // Now we have the internal numeric ID
      removeMovieFromList(
        listId,
        movieInList.id,
        () => {
          setAnimateSuccess(true);
          setSuccessMessage(`Película eliminada de la lista correctamente.`);
          setSuccessType('remove'); // Track success type
          loadLists();
          setTimeout(() => {
            setSuccessMessage("");
            setAnimateSuccess(false);
          }, 2000);
        },
        (error) => {
          setErrors(error);
        }
      );
    } else {
      setErrors({ globalError: "No se pudo identificar la película para eliminar" });
    }
  }
};

  // Manejar la creación de una nueva lista
  const handleCreateList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      createList(
        newListName.trim(),
        (newList) => {
          setNewListName("");
          setShowCreateList(false);
          // Si la creación fue exitosa, añadimos automáticamente la película a la nueva lista
          handleAddToList(newList.id);
          loadLists(); // Recargar todas las listas
        },
        (error) => {
          setErrors(error);
        }
      );
    }
  };

  // Cerrar modal con animación
  const handleClose = () => {
    const modal = document.querySelector('.modal-content-manage-in-lists');
    if (modal) {
      modal.classList.add('fade-out');
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      // Si no se encuentra el modal, cerrar directamente
      onClose();
    }
  };

  return (
    <div className={`modal-overlay-list-modal ${theme}`} onClick={handleClose}>
      <div 
        className={`modal-content-manage-in-lists ${theme}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Gestionar en listas</h2>
          <button className={`close-button ${theme}`} onClick={handleClose}>×</button>
        </div>
        
        {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}
        
        {successMessage && (
          <div className={`success-message ${successType} ${animateSuccess ? 'animate' : ''}`}>
            <span className="success-icon">
              {successType === 'add' ? '✓' : '🗑️'}
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="movie-preview">
          <img 
            src={movie.verticalPoster || "https://via.placeholder.com/150x225?text=No+Image"} 
            alt={movie.title} 
            className="movie-thumbnail" 
          />
          <div className="movie-preview-info">
            <h3>{movie.title}</h3>
            <p>{movie.releaseYear || "Sin año"}</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-message">Cargando listas...</div>
          </div>
        ) : (
          <>
            {showCreateList ? (
              <form onSubmit={handleCreateList} className="create-list-form">
                <h3>Crear nueva lista</h3>
                <div className="input-container">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Nombre de la lista"
                    className={theme}
                    required
                  />
                </div>
                <div className="modal-buttons">
                  <button
                    type="submit"
                    className={`list-button primary ${theme}`}
                    disabled={!newListName.trim()}
                  >
                    Crear y añadir película
                  </button>
                  {lists.length > 0 && (
                    <button
                      type="button"
                      className={`list-button secondary ${theme}`}
                      onClick={() => setShowCreateList(false)}
                    >
                      Ver listas existentes
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="lists-section">
                <h3>Mis listas</h3>
                
                {lists.length === 0 ? (
                  <div className="no-lists-message">
                    No tienes listas creadas
                  </div>
                ) : (
                  <div className="lists-grid">
                    {lists.map((list) => (
                      <div 
                        key={list.id} 
                        className={`list-item ${theme} ${list.containsMovie ? 'contains-movie' : ''}`}
                        data-id={list.id}
                      >
                        <div className="list-item-info">
                          <span className="list-name">{list.name}</span>
                          <span className="movie-count-modal">
                            {list.movieCount !== undefined 
                              ? `${list.movieCount} película${list.movieCount !== 1 ? 's' : ''}` 
                              : `${list.movies?.length || 0} película${list.movies?.length !== 1 ? 's' : ''}`
                            }
                          </span>
                        </div>
                        
                        {list.containsMovie ? (
                          <button 
                            className="remove-movie-button-modal"
                            onClick={() => handleRemoveFromList(list.id)}
                            aria-label="Quitar película de esta lista"
                          >
                            <span className="icon">🗑️</span>
                            <span>Quitar</span>
                          </button>
                        ) : (
                          <button 
                            className="add-to-list-button-modal"
                            onClick={() => handleAddToList(list.id)}
                            aria-label="Añadir película a esta lista"
                          >
                            <span className="icon">+</span>
                            <span>Añadir</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  className={`list-button create ${theme}`}
                  onClick={() => setShowCreateList(true)}
                >
                  <span className="plus-icon">+</span>
                  Crear nueva lista
                </button>
              </div>
            )}
          </>
        )}
        
        <div className="modal-footer">
          <button
            className={`list-button cancel ${theme}`}
            onClick={handleClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToListModal;