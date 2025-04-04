import React, { useEffect, useState } from "react";
import { getUserActorLists, addActorToList, createActorList, removeActorFromList, getActorListById } from "../../../backend/actorListService";
import GenericAddToListModal from "./common/GenericAddToListModal";
import "./AddToListModal.css";

const AddActorToListModal = ({ actor, onClose, authenticatedUser }) => {
  const [lists, setLists] = useState([]);
  const [showCreateList, setShowCreateList] = useState(false);
  const [errors, setErrors] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [successType, setSuccessType] = useState("add");

  const userId = authenticatedUser ? authenticatedUser.user.id : null;

  // Función para cargar listas y detectar si un actor ya está en ellas
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
      
      // Para cada lista, buscamos sus detalles completos (incluyendo actores)
      const detailedListsPromises = fetchedLists.map(list => 
        new Promise((resolve) => {
          // Obtenemos los detalles completos de cada lista
          getActorListById(
            list.id,
            (detailedList) => {
              resolve({
                ...detailedList,
                // Verificamos si el actor actual está en esta lista
                containsActor: detailedList.actors?.some(listActor => {
                  // Comparamos por ID
                  if (actor.id && listActor.id) {
                    const actorIdStr = String(actor.id);
                    const listActorIdStr = String(listActor.id);
                    if (actorIdStr === listActorIdStr) {
                      return true;
                    }
                  }
                  
                  // Comparamos por IMDB ID
                  if (actor.imdbId && listActor.imdbId && actor.imdbId === listActor.imdbId) {
                    return true;
                  }
                  
                  // Comparamos por nombre
                  if (actor.name && listActor.name && 
                      actor.name.toLowerCase() === listActor.name.toLowerCase()) {
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
      
      setLists(detailedLists);
      
      // Seleccionar la primera lista que no contiene el actor como predeterminada
      const firstAvailableList = detailedLists.find(list => !list.containsActor);
      if (firstAvailableList) {
        // No necesitamos selectedList
      } else if (detailedLists.length === 0) {
        setShowCreateList(true);
      }
    } catch (error) {
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
  }, [actor.id, actor.imdbId, userId]);

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
  const handleCreateList = (newListName) => {
    createActorList(
      userId,
      newListName,
      (newList) => {
        setShowCreateList(false);
        // Si la creación fue exitosa, añadimos automáticamente el actor a la nueva lista
        handleAddToList(newList.id);
        loadLists(); // Recargar todas las listas
      },
      (error) => {
        setErrors(error);
      }
    );
  };

  // Obtener iniciales para placeholder de imagen
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const renderActorPreview = (actor, theme) => (
    <div className="movie-preview">
      {actor.imageUrl ? (
        <img 
          src={actor.imageUrl}
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
        {actor.birthDate && <p>{new Date(actor.birthDate).getFullYear()}</p>}
      </div>
    </div>
  );

  return (
    <GenericAddToListModal
      item={actor}
      itemType="actor"
      lists={lists}
      loading={loading}
      errors={errors}
      successMessage={successMessage}
      successType={successType}
      animateSuccess={animateSuccess}
      showCreateList={showCreateList}
      onClose={onClose}
      onAddToList={handleAddToList}
      onRemoveFromList={handleRemoveFromList}
      onCreateList={handleCreateList}
      onToggleCreateList={(show) => setShowCreateList(show)}
      onErrorClose={() => setErrors(null)}
      renderItemPreview={renderActorPreview}
    />
  );
};

export default AddActorToListModal;