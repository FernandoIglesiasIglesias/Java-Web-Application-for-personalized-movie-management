import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDirectorListById,
  updateDirectorList,
  deleteDirectorList,
  removeDirectorFromList
} from "../../../backend/directorListService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./DirectorListDetails.css";

const DirectorListDetails = () => {
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
  const loadDirectorListDetails = useCallback(() => {
    setLoading(true);
    getDirectorListById(
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
      loadDirectorListDetails();
    }
  }, [id, loadDirectorListDetails]);

  // Manejar actualización del nombre de la lista
  const handleUpdateList = () => {
    if (listName.trim() && listName !== list.name) {
      setLoading(true);
      updateDirectorList(
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
    deleteDirectorList(
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

  // Manejar eliminación de un director de la lista
  const handleRemoveDirector = (directorId, event) => {
    if (event) {
      event.stopPropagation(); // Evitar que el clic se propague a la tarjeta
    }

    const directorCard = event.target.closest('.director-card');

    if (directorCard) {
      directorCard.classList.add('removing');
      
      setTimeout(() => {
        removeDirectorFromList(
          id,
          directorId,
          (updatedList) => {
            setList(updatedList);
          },
          (error) => {
            setErrors(error);
          }
        );
      }, 500);
    } else {
      removeDirectorFromList(
        id,
        directorId,
        (updatedList) => {
          setList(updatedList);
        },
        (error) => {
          setErrors(error);
        }
      );
    }
  };

  // Manejar vaciado de la lista (eliminar todos los directores)
  const handleClearList = () => {
    if (list && list.directors && list.directors.length > 0) {
      setLoading(true);
      
      // Esta implementación elimina los directores uno por uno
      const removeDirectorPromises = list.directors.map(director => 
        new Promise((resolve, reject) => {
          removeDirectorFromList(
            id,
            director.id,
            () => resolve(),
            (error) => reject(error)
          );
        })
      );
      
      Promise.all(removeDirectorPromises)
        .then(() => {
          loadDirectorListDetails();
          setIsConfirmClearOpen(false);
        })
        .catch((error) => {
          setErrors(error);
          setIsConfirmClearOpen(false);
          setLoading(false);
        });
    }
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

        {/* Diálogo de confirmación para eliminar lista */}
        {isConfirmDeleteOpen && (
          <div className="confirm-dialog-overlay">
            <div className={`confirm-dialog ${theme}`}>
              <h2>¿Eliminar lista?</h2>
              <p>
                ¿Estás seguro de que quieres eliminar la lista "{list.name}"? Esta acción no se puede deshacer.
              </p>
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

        {/* Diálogo de confirmación para vaciar lista */}
        {isConfirmClearOpen && (
          <div className="confirm-dialog-overlay">
            <div className={`confirm-dialog ${theme}`}>
              <h2>¿Vaciar lista?</h2>
              <p>
                ¿Estás seguro de que quieres eliminar todos los directores de la lista "{list.name}"? Esta acción no se puede deshacer.
              </p>
              <div className="confirm-actions">
                <button
                  className={`list-button danger ${theme}`}
                  onClick={handleClearList}
                >
                  Vaciar
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

        {/* Contenido de la lista: directores */}
        <div className="list-content-container">
          <h2>Directores en esta lista</h2>
          
          {list && list.directors && list.directors.length > 0 ? (
            <div className="directors-grid">
              {list.directors.map((director) => (
                <div
                  key={director.id}
                  className={`director-card ${theme}`}
                >
                  <div className="director-card-inner">
                    <div className="director-image-container">
                      {director.imageUrl ? (
                        <img
                          src={director.imageUrl}
                          alt={director.name}
                          className="director-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150x225?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="director-placeholder">
                          <span>{director.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="director-info">
                      <h3>{director.name}</h3>
                      <div className="director-meta">
                        {director.knownFor && (
                          <span className="director-known-for">{director.knownFor}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`remove-button ${theme}`}
                      onClick={(e) => handleRemoveDirector(director.id, e)}
                      aria-label="Eliminar director de la lista"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-items-container">
              <div className="no-items-icon">🎥</div>
              <p className="no-directors-message">No hay directores en esta lista.</p>
              <p className="no-directors-suggestion">
                Añade directores desde las páginas de películas seleccionando "Añadir a lista".
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción al final de la página */}
        <div className="list-bottom-actions">
          <button
            className={`list-button danger ${theme}`}
            onClick={() => {
              if (list?.directors?.length > 0) {
                setIsConfirmClearOpen(true);
              } else {
                setErrors({
                  globalError: "La lista ya está vacía."
                });
              }
            }}
            disabled={!list?.directors?.length}
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

export default DirectorListDetails;