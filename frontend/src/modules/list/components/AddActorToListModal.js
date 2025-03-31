import React, { useEffect, useState } from "react";
import { getUserActorLists, addActorToList, createActorList, removeActorFromList, getActorListById } from "../../../backend/actorListService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./AddToListModal.css"; // Reutilizamos los estilos existentes

const AddActorToListModal = ({ actor, onClose }) => {
  const { theme } = useTheme();
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState("");
  const [newListName, setNewListName] = useState("");
  const [showCreateList, setShowCreateList] = useState(false);
  const [errors, setErrors] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [successType, setSuccessType] = useState("add"); // add o remove
  const [userId, setUserId] = useState(1); // ID de usuario por defecto, modificar según necesidades

// Función mejorada para cargar listas y detectar correctamente si un actor ya está en ellas
const loadLists = async () => {
    setLoading(true);
    
    try {
      // Primero obtenemos la lista de todas las listas de actores del usuario
      const fetchListsPromise = new Promise((resolve, reject) => {
        getUserActorLists(
          userId,
          (fetchedLists) => resolve(fetchedLists),
          (error) => reject(error)
        );
      });
      
      const fetchedLists = await fetchListsPromise;
      console.log('Listas recuperadas:', fetchedLists);
      
      // Para cada lista, buscamos sus detalles completos (incluyendo actores)
      const detailedListsPromises = fetchedLists.map(list => 
        new Promise((resolve) => {
          // Obtenemos los detalles completos de cada lista
          getActorListById(
            list.id,
            (detailedList) => {
              console.log(`Detalles completos de lista ${list.name}:`, detailedList);
              resolve({
                ...detailedList,
                // Verificamos si el actor actual está en esta lista
                containsActor: detailedList.actors?.some(listActor => {
                  // Comparamos por ID
                  if (actor.id && listActor.id) {
                    const actorIdStr = String(actor.id);
                    const listActorIdStr = String(listActor.id);
                    if (actorIdStr === listActorIdStr) {
                      console.log(`✓ Lista ${list.name} contiene al actor ${actor.name} (coincidencia por ID)`);
                      return true;
                    }
                  }
                  
                  // Comparamos por IMDB ID
                  if (actor.imdbId && listActor.imdbId && actor.imdbId === listActor.imdbId) {
                    console.log(`✓ Lista ${list.name} contiene al actor ${actor.name} (coincidencia por IMDB ID)`);
                    return true;
                  }
                  
                  // Comparamos por nombre
                  if (actor.name && listActor.name && 
                      actor.name.toLowerCase() === listActor.name.toLowerCase()) {
                    console.log(`✓ Lista ${list.name} contiene al actor ${actor.name} (coincidencia por nombre)`);
                    return true;
                  }
                  
                  return false;
                }) || false
              });
            },
            (error) => {
              console.error(`Error al obtener detalles de la lista ${list.name}:`, error);
              resolve({
                ...list,
                actors: [],
                containsActor: false
              });
            }
          );
        })
      );
      
      // Esperamos a que todas las solicitudes de detalles se completen
      const detailedLists = await Promise.all(detailedListsPromises);
      console.log('Listas procesadas con detalles:', detailedLists);
      
      setLists(detailedLists);
      
      // Seleccionar la primera lista que no contiene el actor como predeterminada
      const firstAvailableList = detailedLists.find(list => !list.containsActor);
      if (firstAvailableList) {
        setSelectedList(firstAvailableList.id);
      } else if (detailedLists.length === 0) {
        setShowCreateList(true);
      }
    } catch (error) {
      console.error('Error al cargar las listas:', error);
      if (error.globalError === "project.exceptions.EmptyUserListsException") {
        setShowCreateList(true);
      } else {
        setErrors(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, [actor.id, actor.imdbId]);

  // Manejar la adición del actor a la lista seleccionada
  const handleAddToList = (listId) => {
    addActorToList(
      listId,
      actor.id,
      () => {
        // Encontrar y animar el elemento de la lista
        const listItem = document.querySelector(`.list-item[data-id="${listId}"]`);
        if (listItem) {
          listItem.classList.add('adding');
          setTimeout(() => listItem.classList.remove('adding'), 600);
        }
        
        setAnimateSuccess(true);
        setSuccessMessage(`Actor añadido a la lista correctamente.`);
        setSuccessType('add');
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

  // Manejar la eliminación del actor de una lista
  const handleRemoveFromList = (listId) => {
    // Encontrar el elemento de la lista primero para animarlo
    const listItem = document.querySelector(`.list-item[data-id="${listId}"]`);
    if (listItem) {
      listItem.classList.add('removing');
    }
    
    removeActorFromList(
      listId,
      actor.id,
      () => {
        setAnimateSuccess(true);
        setSuccessMessage(`Actor eliminado de la lista correctamente.`);
        setSuccessType('remove');
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

  // Manejar la creación de una nueva lista
  const handleCreateList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      createActorList(
        userId,
        newListName.trim(),
        (newList) => {
          setNewListName("");
          setShowCreateList(false);
          // Si la creación fue exitosa, añadimos automáticamente el actor a la nueva lista
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

  // Obtener iniciales para placeholder de imagen
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className={`modal-overlay-list-modal ${theme}`} onClick={handleClose}>
      <div 
        className={`modal-content-manage-in-lists ${theme}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Gestionar actor en listas</h2>
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
          {actor.image_url ? (
            <img 
              src={actor.image_url}
              alt={actor.name || 'Actor'} 
              className="movie-thumbnail"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://via.placeholder.com/150x225/cccccc/666666?text=${getInitials(actor.name)}`;
              }} 
            />
          ) : (
            <img 
              src={`https://via.placeholder.com/150x225/cccccc/666666?text=${getInitials(actor.name)}`}
              alt={actor.name || 'Actor'} 
              className="movie-thumbnail"
            />
          )}
          <div className="movie-preview-info">
            <h3>{actor.name || 'Actor desconocido'}</h3>
            {actor.birth_date && <p>{actor.birth_date}</p>}
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
                    Crear y añadir actor
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
                        className={`list-item ${theme} ${list.containsActor ? 'contains-movie' : ''}`}
                        data-id={list.id}
                      >
                        <div className="list-item-info">
                          <span className="list-name">{list.name}</span>
                          <span className="movie-count-modal">
                            {list.actorCount !== undefined 
                              ? `${list.actorCount} actor${list.actorCount !== 1 ? 'es' : ''}` 
                              : `${list.actors?.length || 0} actor${list.actors?.length !== 1 ? 'es' : ''}`
                            }
                          </span>
                        </div>
                        
                        {list.containsActor ? (
                          <button 
                            className="remove-movie-button-modal"
                            onClick={() => handleRemoveFromList(list.id)}
                            aria-label="Quitar actor de esta lista"
                          >
                            <span className="icon">🗑️</span>
                            <span>Quitar</span>
                          </button>
                        ) : (
                          <button 
                            className="add-to-list-button-modal"
                            onClick={() => handleAddToList(list.id)}
                            aria-label="Añadir actor a esta lista"
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

export default AddActorToListModal;