import React, { useEffect, useState } from "react";
import { getUserLists, addMovieToList, createList, removeMovieFromList } from "../../../backend/listService";
import GenericAddToListModal from "./common/GenericAddToListModal";
import "./AddToListModal.css";

const AddToListModal = ({ movie, onClose, authenticatedUser }) => {
  const [lists, setLists] = useState([]);
  const [showCreateList, setShowCreateList] = useState(false);
  const [errors, setErrors] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [successType, setSuccessType] = useState("add");

  // Cargar todas las listas y marcar las que ya contienen la película
  const loadLists = () => {
    setLoading(true);
    getUserLists(
      (fetchedLists) => {
        // Para cada lista, determinar si ya contiene la película
        const processedLists = fetchedLists.map(list => {
          const movieExists = list.movies?.some(
            listMovie => listMovie.id === movie.id || listMovie.imdbId === movie.imdbId
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
          // Ya no necesitamos selectedList en este componente
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
  }, [movie.id, movie.imdbId]);

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
    } else {
      // If we only have the IMDB ID, we need to find the movie in the list first
      const listWithMovie = lists.find(list => list.id === listId);
      const movieInList = listWithMovie?.movies?.find(
        m => m.imdbId === movie.imdbId || m.id === movie.imdbId
      );
      
      if (movieInList && movieInList.id) {
        // Now we have the internal numeric ID
        removeMovieFromList(
          listId,
          movieInList.id,
          () => {
            setAnimateSuccess(true);
            setSuccessMessage(`Película eliminada de la lista correctamente.`);
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
      } else {
        setErrors({ globalError: "No se pudo identificar la película para eliminar" });
      }
    }
  };

  // Manejar la creación de una nueva lista
  const handleCreateList = (newListName) => {
    createList(
      newListName,
      (newList) => {
        setShowCreateList(false);
        // Si la creación fue exitosa, añadimos automáticamente la película a la nueva lista
        handleAddToList(newList.id);
        loadLists(); // Recargar todas las listas
      },
      (error) => {
        setErrors(error);
      }
    );
  };

  // Renderizar la vista previa de la película
  const renderMoviePreview = (movie, theme) => (
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
  );

  return (
    <GenericAddToListModal
      item={movie}
      itemType="movie"
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
      renderItemPreview={renderMoviePreview}
    />
  );
};

export default AddToListModal;