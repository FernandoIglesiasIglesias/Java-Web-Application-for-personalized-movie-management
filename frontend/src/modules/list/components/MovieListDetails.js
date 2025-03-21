import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getListById,
  updateList,
  deleteList,
  removeMovieFromList
} from "../../../backend/listService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./MovieListDetails.css";

const MovieListDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [list, setList] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [listName, setListName] = useState("");
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Función para cargar los detalles de la lista
  const loadMovieListDetails = useCallback(() => {
    setLoading(true);
    getListById(
      id,
      (fetchedList) => {
        setList(fetchedList);
        setListName(fetchedList.name);
        setLoading(false);
      },
      (error) => {
        setErrors(error);
        setLoading(false);
      }
    );
  }, [id]);

  // Cargar los detalles de la lista al montar el componente o cambiar el ID
  useEffect(() => {
    if (id) {
      loadMovieListDetails();
    }
  }, [id, loadMovieListDetails]);

  // Manejar actualización del nombre de la lista
  const handleUpdateList = () => {
    if (listName.trim() && listName !== list.name) {
      setLoading(true);
      updateList(
        id,
        listName.trim(),
        (updatedList) => {
          setList(updatedList);
          setEditMode(false);
          setErrors(null);
          setLoading(false);
        },
        (error) => {
          setErrors(error);
          setLoading(false);
        }
      );
    } else {
      setEditMode(false);
    }
  };

  // Manejar eliminación de la lista
  const handleDeleteList = () => {
    setLoading(true);
    deleteList(
      id,
      () => {
        navigate("/user/lists", { state: { message: "Lista eliminada correctamente" } });
      },
      (error) => {
        setErrors(error);
        setIsConfirmDeleteOpen(false);
        setLoading(false);
      }
    );
  };

  // Manejar eliminación de una película de la lista
  const handleRemoveMovie = (movieId, event) => {
    if (event) {
      event.stopPropagation(); // Evitar que el clic se propague a la tarjeta
    }

    const movieCard = event.target.closest('.movie-card');

  if (movieCard) {
    movieCard.classList.add('removing');
    
    setTimeout(() => {
      removeMovieFromList(
        id,
        movieId,
        (updatedList) => {
          setList(updatedList);
        },
        (error) => {
          setErrors(error);
        }
      );
    }, 500);
  } else {
    removeMovieFromList(
      id,
      movieId,
      (updatedList) => {
        setList(updatedList);
      },
      (error) => {
        setErrors(error);
      }
    );
  }
  };

  // Manejar vaciado de la lista (eliminar todas las películas)
  const handleClearList = () => {
    if (list && list.movies && list.movies.length > 0) {
      setLoading(true);
      
      // Esta implementación elimina las películas una por una
      // Para un mejor rendimiento, se debería crear un endpoint en la API para eliminar todas a la vez
      const removeMoviePromises = list.movies.map(movie => 
        new Promise((resolve, reject) => {
          removeMovieFromList(
            id,
            movie.id,
            () => resolve(),
            (error) => reject(error)
          );
        })
      );
      
      Promise.all(removeMoviePromises)
        .then(() => {
          loadMovieListDetails();
          setIsConfirmClearOpen(false);
        })
        .catch((error) => {
          setErrors(error);
          setIsConfirmClearOpen(false);
          setLoading(false);
        });
    }
  };

  // Navegar a la página de detalle de una película
  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  // Si está cargando, mostrar mensaje de carga
  if (loading) {
    return (
      <div className="list-details-page">
        <div className={`list-details-container ${theme}`}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">Cargando detalles de la lista...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="list-details-page">
      <div className={`list-details-container ${theme}`}>
        {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}
        
        {/* Cabecera con el nombre de la lista y botones de acción */}
        <div className={`list-header ${theme}`}>
          {editMode ? (
            <div className="edit-list-name">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className={theme}
                autoFocus
              />
              <div className="edit-actions">
                <button
                  className={`list-button primary ${theme}`}
                  onClick={handleUpdateList}
                  disabled={!listName.trim() || listName === list.name}
                >
                  Guardar
                </button>
                <button
                  className={`list-button secondary ${theme}`}
                  onClick={() => {
                    setEditMode(false);
                    setListName(list.name);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1>{list?.name}</h1>
              <div className="list-actions">
                <button
                  className={`list-button primary ${theme}`}
                  onClick={() => setEditMode(true)}
                >
                  Editar nombre
                </button>
                <button
                  className={`list-button danger ${theme}`}
                  onClick={() => setIsConfirmDeleteOpen(true)}
                >
                  Eliminar lista
                </button>
              </div>
            </>
          )}
        </div>

        {isConfirmDeleteOpen && (
          <div className="modal-overlay">
            <div className={`confirm-modal-on-list ${theme}`}>
              <span className="confirm-icon">⚠️</span>
              <h3>¿Estás seguro de eliminar esta lista?</h3>
              <p>Esta acción eliminará permanentemente la lista y todas sus películas. No podrás recuperar esta información después.</p>
              <div className="confirm-actions">
                <button
                  className={`list-button danger ${theme}`}
                  onClick={handleDeleteList}
                >
                  Eliminar
                </button>
                <button
                  className={`list-button secondary ${theme}`}
                  onClick={() => setIsConfirmDeleteOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {isConfirmClearOpen && (
          <div className="modal-overlay">
            <div className={`confirm-modal-on-list ${theme}`}>
              <span className="confirm-icon">⚠️</span>
              <h3>¿Estás seguro de eliminar todas las películas?</h3>
              <p>Esta acción eliminará todas las películas de esta lista. La lista seguirá existiendo, pero estará vacía.</p>
              <div className="confirm-actions">
                <button
                  className={`list-button danger ${theme}`}
                  onClick={handleClearList}
                >
                  Vaciar lista
                </button>
                <button
                  className={`list-button secondary ${theme}`}
                  onClick={() => setIsConfirmClearOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la lista: películas */}
        <div className="movies-section">
          <div className="section-header">
            <h2>Películas en esta lista</h2>
            {list && list.movies && list.movies.length > 0 && (
              <span className="movie-count list-detail">
                {list.movies.length} película{list.movies.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {list && list.movies && list.movies.length > 0 ? (
            <div className="movies-grid">
              {list.movies.map((movie) => (
                <div 
                  key={movie.id} 
                  className={`movie-card ${theme}`} 
                  onClick={() => handleMovieClick(movie.imdbId || movie.id)}
                >
                  <div className="movie-poster-container">
                    <img
                      src={movie.verticalPoster || "https://via.placeholder.com/300x450?text=Sin+Imagen"}
                      alt={movie.title}
                      className="movie-poster"
                    />
                    <div className="movie-overlay">
                      <button
                        className="movie-remove-button"
                        onClick={(e) => handleRemoveMovie(movie.id, e)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <p>{movie.releaseYear || "Sin año"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-movies-container">
              <div className="no-movies-icon">🎬</div>
              <p className="no-movies-message">No hay películas en esta lista.</p>
              <p className="no-movies-suggestion">
                Añade películas navegando al explorador de películas y seleccionando "Añadir a lista".
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción al final de la página */}
        <div className="list-bottom-actions">
          <button
            className={`list-button primary ${theme}`}
            onClick={() => navigate("/movies")} // Navega a la página de búsqueda de películas
          >
            Explorar películas
          </button>
          
          <button
            className={`list-button danger ${theme}`}
            onClick={() => {
              if (list?.movies?.length > 0) {
                setIsConfirmClearOpen(true);
              } else {
                setErrors({
                  globalError: "La lista ya está vacía."
                });
              }
            }}
            disabled={!list?.movies?.length}
          >
            Vaciar lista
          </button>
          
          <button
            className={`list-button secondary ${theme}`}
            onClick={() => navigate("/user/lists")}
          >
            Volver a mis listas
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieListDetails;