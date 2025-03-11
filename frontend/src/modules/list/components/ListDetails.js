import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getListById,
  updateList,
  deleteList,
  removeMovieFromList
} from "../../../backend/listService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./ListDetails.css";

const ListDetails = () => {
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
  const loadListDetails = React.useCallback(() => {
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
      loadListDetails();
    }
  }, [id, loadListDetails]);

  // Manejar actualización del nombre de la lista
  const handleUpdateList = () => {
    if (listName.trim() && listName !== list.name) {
      updateList(
        id,
        listName.trim(),
        (updatedList) => {
          setList(updatedList);
          setEditMode(false);
          setErrors(null);
        },
        (error) => {
          setErrors(error);
        }
      );
    } else {
      setEditMode(false);
    }
  };

  // Manejar eliminación de la lista
  const handleDeleteList = () => {
    deleteList(
      id,
      () => {
        navigate("/user/lists");
      },
      (error) => {
        setErrors(error);
        setIsConfirmDeleteOpen(false);
      }
    );
  };

  // Manejar eliminación de una película de la lista
  const handleRemoveMovie = (movieId) => {
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
  };

  // Manejar vaciado de la lista (eliminar todas las películas)
  const handleClearList = () => {
    if (list && list.movies && list.movies.length > 0) {
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
          loadListDetails();
          setIsConfirmClearOpen(false);
        })
        .catch((error) => {
          setErrors(error);
          setIsConfirmClearOpen(false);
        });
    }
  };

  // Navegar a la página de detalle de una película
  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  // Si está cargando, mostrar mensaje de carga
  if (loading) {
    return <div className="loading-message">Cargando detalles de la lista...</div>;
  }

  return (
    <div className={`list-details-container ${theme}`}>
      {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}
      
      {/* Cabecera con el nombre de la lista y botones de acción */}
      <div className="list-header">
        {editMode ? (
          <div className="edit-list-name">
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className={theme}
            />
            <button
              className={`list-button ${theme}`}
              onClick={handleUpdateList}
            >
              Guardar
            </button>
            <button
              className={`list-button red ${theme}`}
              onClick={() => setEditMode(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <h2>{list?.name}</h2>
            <div className="list-actions">
              <button
                className={`list-button ${theme}`}
                onClick={() => setEditMode(true)}
              >
                Editar nombre
              </button>
              <button
                className={`list-button red ${theme}`}
                onClick={() => setIsConfirmDeleteOpen(true)}
              >
                Eliminar lista
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminar lista */}
      {isConfirmDeleteOpen && (
        <div className={`confirm-modal ${theme}`}>
          <div className={`confirm-content ${theme}`}>
            <h3>¿Estás seguro de eliminar esta lista?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="confirm-actions">
              <button
                className={`list-button red ${theme}`}
                onClick={handleDeleteList}
              >
                Eliminar
              </button>
              <button
                className={`list-button ${theme}`}
                onClick={() => setIsConfirmDeleteOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para vaciar lista */}
      {isConfirmClearOpen && (
        <div className={`confirm-modal ${theme}`}>
          <div className={`confirm-content ${theme}`}>
            <h3>¿Estás seguro de eliminar todas las películas de esta lista?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="confirm-actions">
              <button
                className={`list-button red ${theme}`}
                onClick={handleClearList}
              >
                Vaciar lista
              </button>
              <button
                className={`list-button ${theme}`}
                onClick={() => setIsConfirmClearOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido de la lista: películas */}
      <div className="movies-in-list">
        <h3>Películas en esta lista</h3>
        {list && list.movies && list.movies.length > 0 ? (
          <div className="movies-grid">
            {list.movies.map((movie) => (
              <div 
                key={movie.id} 
                className={`movie-card ${theme}`} 
                onClick={() => handleMovieClick(movie.imbdId || movie.id)}
              >
                <img
                  src={movie.verticalPoster || "placeholder-image.jpg"}
                  alt={movie.title}
                />
                <div className="movie-info">
                  <h4>{movie.title}</h4>
                  <p>{movie.releaseYear}</p>
                  <button
                    className={`movie-remove-button ${theme}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
                      handleRemoveMovie(movie.id);
                    }}
                  >
                    Eliminar de la lista
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-movies-message">No hay películas en esta lista.</p>
        )}
      </div>

      {/* Botones de acción al final de la página */}
      <div className="list-bottom-actions">
        <button
          className={`list-button ${theme}`}
          onClick={() => navigate("/movies")} // Navega a la página de búsqueda de películas
        >
          Añadir películas
        </button>
        
        <button
          className={`list-button red ${theme}`}
          onClick={() => {
            if (list?.movies?.length > 0) {
              setIsConfirmClearOpen(true);
            } else {
              alert("No hay películas para eliminar en esta lista.");
            }
          }}
          disabled={!list?.movies?.length}
        >
          Vaciar lista
        </button>
        
        <button
          className={`list-button back ${theme}`}
          onClick={() => navigate("/user/lists")}
        >
          Volver a mis listas
        </button>
      </div>
    </div>
  );
};

export default ListDetails;