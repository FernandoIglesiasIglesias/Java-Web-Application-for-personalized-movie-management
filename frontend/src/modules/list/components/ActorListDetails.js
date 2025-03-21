import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getActorListById,
  updateActorList,
  deleteActorList,
  removeActorFromList
} from "../../../backend/actorListService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./ActorListDetails.css";

const ActorListDetails = () => {
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
  const loadActorListDetails = useCallback(() => {
    setLoading(true);
    getActorListById(
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
      loadActorListDetails();
    }
  }, [id, loadActorListDetails]);

  // Manejar actualización del nombre de la lista
  const handleUpdateList = () => {
    if (listName.trim() && listName !== list.name) {
      setLoading(true);
      updateActorList(
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
    deleteActorList(
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

  // Manejar eliminación de un actor de la lista
  const handleRemoveActor = (actorId, event) => {
    if (event) {
      event.stopPropagation(); // Evitar que el clic se propague a la tarjeta
    }

    const actorCard = event.target.closest('.actor-card');

    if (actorCard) {
      actorCard.classList.add('removing');
      
      setTimeout(() => {
        removeActorFromList(
          id,
          actorId,
          (updatedList) => {
            setList(updatedList);
          },
          (error) => {
            setErrors(error);
          }
        );
      }, 500);
    } else {
      removeActorFromList(
        id,
        actorId,
        (updatedList) => {
          setList(updatedList);
        },
        (error) => {
          setErrors(error);
        }
      );
    }
  };

  // Manejar vaciado de la lista (eliminar todos los actores)
  const handleClearList = () => {
    if (list && list.actors && list.actors.length > 0) {
      setLoading(true);
      
      // Esta implementación elimina los actores uno por uno
      // Para un mejor rendimiento, se debería crear un endpoint en la API para eliminar todos a la vez
      const removeActorPromises = list.actors.map(actor => 
        new Promise((resolve, reject) => {
          removeActorFromList(
            id,
            actor.id,
            () => resolve(),
            (error) => reject(error)
          );
        })
      );
      
      Promise.all(removeActorPromises)
        .then(() => {
          loadActorListDetails();
          setIsConfirmClearOpen(false);
        })
        .catch((error) => {
          setErrors(error);
          setIsConfirmClearOpen(false);
          setLoading(false);
        });
    }
  };

  // Navegar a la página de detalle de un actor
  const handleActorClick = (actorName) => {
    navigate(`/actors/${encodeURIComponent(actorName)}`);
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
                ¿Estás seguro de que quieres eliminar todos los actores de la lista "{list.name}"? Esta acción no se puede deshacer.
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

        {/* Contenido de la lista: actores */}
        <div className="list-content-container">
          <h2>Actores en esta lista</h2>
          
          {list && list.actors && list.actors.length > 0 ? (
            <div className="actors-grid">
              {list.actors.map((actor) => (
                <div
                  key={actor.id}
                  className={`actor-card ${theme}`}
                  onClick={() => handleActorClick(`${actor.firstName} ${actor.lastName}`)}
                >
                  <div className="actor-card-inner">
                    <div className="actor-image-container">
                      {actor.imageUrl ? (
                        <img
                          src={actor.imageUrl}
                          alt={`${actor.firstName} ${actor.lastName}`}
                          className="actor-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150x225?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="actor-placeholder">
                          <span>{actor.firstName.charAt(0)}{actor.lastName.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="actor-info">
                      <h3>{`${actor.firstName} ${actor.lastName}`}</h3>
                      <div className="actor-meta">
                        {actor.birthDate && (
                          <span className="actor-birth-date">
                            {new Date(actor.birthDate).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`remove-button ${theme}`}
                      onClick={(e) => handleRemoveActor(actor.id, e)}
                      aria-label="Eliminar actor de la lista"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-items-container">
              <div className="no-items-icon">🎭</div>
              <p className="no-actors-message">No hay actores en esta lista.</p>
              <p className="no-actors-suggestion">
                Añade actores navegando a los perfiles de actores y seleccionando "Añadir a lista".
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción al final de la página */}
        <div className="list-bottom-actions">
          <button
            className={`list-button danger ${theme}`}
            onClick={() => {
              if (list?.actors?.length > 0) {
                setIsConfirmClearOpen(true);
              } else {
                setErrors({
                  globalError: "La lista ya está vacía."
                });
              }
            }}
            disabled={!list?.actors?.length}
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

export default ActorListDetails;