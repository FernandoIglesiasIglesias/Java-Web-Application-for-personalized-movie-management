import React, { useEffect, useState } from "react";
import { getUserDirectorLists, addDirectorToList, createDirectorList, removeDirectorFromList, getDirectorListById } from "../../../backend/directorListService";
import GenericAddToListModal from "./common/GenericAddToListModal";
import "./AddToListModal.css";

const AddDirectorToListModal = ({ director, onClose, authenticatedUser }) => {
  const [lists, setLists] = useState([]);
  const [showCreateList, setShowCreateList] = useState(false);
  const [errors, setErrors] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [successType, setSuccessType] = useState("add");

  const userId = authenticatedUser ? authenticatedUser.user.id : null;

  // Función para cargar listas y detectar si un director ya está en ellas
  const loadLists = async () => {
    setLoading(true);
    
    try {
      // Primero obtenemos la lista de todas las listas de directores del usuario
      const fetchListsPromise = new Promise((resolve, reject) => {
        getUserDirectorLists(
          userId,
          (fetchedLists) => resolve(fetchedLists),
          (error) => reject(error)
        );
      });
      
      const fetchedLists = await fetchListsPromise;
      
      // Para cada lista, buscamos sus detalles completos (incluyendo directores)
      const detailedListsPromises = fetchedLists.map(list => 
        new Promise((resolve) => {
          // Obtenemos los detalles completos de cada lista
          getDirectorListById(
            list.id,
            (detailedList) => {
              resolve({
                ...detailedList,
                // Verificamos si el director actual está en esta lista
                containsDirector: detailedList.directors?.some(listDirector => {
                  // Comparamos por ID
                  if (director.id && listDirector.id) {
                    const directorIdStr = String(director.id);
                    const listDirectorIdStr = String(listDirector.id);
                    if (directorIdStr === listDirectorIdStr) {
                      return true;
                    }
                  }
                  
                  // Comparamos por IMDB ID
                  if (director.imdbId && listDirector.imdbId && director.imdbId === listDirector.imdbId) {
                    return true;
                  }
                  
                  // Comparamos por nombre
                  if (director.name && listDirector.name && 
                      director.name.toLowerCase() === listDirector.name.toLowerCase()) {
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
                directors: [],
                containsDirector: false
              });
            }
          );
        })
      );
      
      // Esperamos a que todas las solicitudes de detalles se completen
      const detailedLists = await Promise.all(detailedListsPromises);
      
      setLists(detailedLists);
      
      // Seleccionar la primera lista que no contiene el director como predeterminada
      const firstAvailableList = detailedLists.find(list => !list.containsDirector);
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
  }, [director.id, director.imdbId, userId]);

  // Manejar la adición del director a la lista seleccionada
  const handleAddToList = (listId) => {
    addDirectorToList(
      listId,
      director.id,
      () => {
        // Encontrar y animar el elemento de la lista
        const listItem = document.querySelector(`.list-item[data-id="${listId}"]`);
        if (listItem) {
          listItem.classList.add('adding');
          setTimeout(() => listItem.classList.remove('adding'), 600);
        }
        
        setAnimateSuccess(true);
        setSuccessMessage(`Director añadido a la lista correctamente.`);
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

  // Manejar la eliminación del director de una lista
  const handleRemoveFromList = (listId) => {
    // Encontrar el elemento de la lista primero para animarlo
    const listItem = document.querySelector(`.list-item[data-id="${listId}"]`);
    if (listItem) {
      listItem.classList.add('removing');
    }
    
    removeDirectorFromList(
      listId,
      director.id,
      () => {
        setAnimateSuccess(true);
        setSuccessMessage(`Director eliminado de la lista correctamente.`);
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
    createDirectorList(
      userId,
      newListName,
      (newList) => {
        setShowCreateList(false);
        // Si la creación fue exitosa, añadimos automáticamente el director a la nueva lista
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

  // Renderizar la vista previa del director
  const renderDirectorPreview = (director, theme) => (
    <div className="movie-preview">
      {director.image_url ? (
        <img 
          src={director.image_url}
          alt={director.name || 'Director'} 
          className="movie-thumbnail"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://via.placeholder.com/150x225/cccccc/666666?text=${getInitials(director.name)}`;
          }} 
        />
      ) : (
        <img 
          src={`https://via.placeholder.com/150x225/cccccc/666666?text=${getInitials(director.name)}`}
          alt={director.name || 'Director'} 
          className="movie-thumbnail"
        />
      )}
      <div className="movie-preview-info">
        <h3>{director.name || 'Director desconocido'}</h3>
        {director.birth_date && <p>{director.birth_date}</p>}
      </div>
    </div>
  );

  return (
    <GenericAddToListModal
      item={director}
      itemType="director"
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
      renderItemPreview={renderDirectorPreview}
    />
  );
};

export default AddDirectorToListModal;