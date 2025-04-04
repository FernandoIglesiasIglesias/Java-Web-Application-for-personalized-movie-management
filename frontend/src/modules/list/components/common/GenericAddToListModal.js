import React, { useState } from "react";
import { useTheme } from "../../../../context/ThemeContext";
import { Errors } from "../../../common";
import "../AddToListModal.css";

const GenericAddToListModal = ({
  item,
  itemType,
  lists,
  loading,
  errors,
  successMessage,
  successType,
  animateSuccess,
  showCreateList,
  onClose,
  onAddToList,
  onRemoveFromList,
  onCreateList,
  onToggleCreateList,
  onErrorClose,
  renderItemPreview
}) => {
  const { theme } = useTheme();
  const [newListName, setNewListName] = useState("");
  
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

  // Manejar la creación de una nueva lista
  const handleCreateList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName("");
    }
  };

  const getItemTypeName = () => {
    switch (itemType) {
      case 'movie': return 'película';
      case 'actor': return 'actor';
      case 'director': return 'director';
      default: return 'elemento';
    }
  };

  const getItemTypeNamePlural = () => {
    switch (itemType) {
      case 'movie': return 'películas';
      case 'actor': return 'actores';
      case 'director': return 'directores';
      default: return 'elementos';
    }
  };

  const getContainsPropertyName = () => {
    switch (itemType) {
      case 'movie': return 'containsMovie';
      case 'actor': return 'containsActor';
      case 'director': return 'containsDirector';
      default: return '';
    }
  };
  
  const getCountPropertyName = () => {
    switch (itemType) {
      case 'movie': return 'movieCount';
      case 'actor': return 'actorCount';
      case 'director': return 'directorCount';
      default: return '';
    }
  };

  const getItemsArrayPropertyName = () => {
    switch (itemType) {
      case 'movie': return 'movies';
      case 'actor': return 'actors';
      case 'director': return 'directors';
      default: return '';
    }
  };

  const containsPropertyName = getContainsPropertyName();
  const countPropertyName = getCountPropertyName();
  const itemsArrayPropertyName = getItemsArrayPropertyName();

  return (
    <div className={`modal-overlay-list-modal ${theme}`} onClick={handleClose}>
      <div 
        className={`modal-content-manage-in-lists ${theme}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Gestionar {getItemTypeName()} en listas</h2>
          <button className={`close-button ${theme}`} onClick={handleClose}>×</button>
        </div>
        
        {errors && <Errors errors={errors} onClose={onErrorClose} />}
        
        {successMessage && (
          <div className={`success-message ${successType} ${animateSuccess ? 'animate' : ''}`}>
            <span className="success-icon">
              {successType === 'add' ? '✓' : '🗑️'}
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        {renderItemPreview && renderItemPreview(item, theme)}

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
                    Crear y añadir {getItemTypeName()}
                  </button>
                  {lists.length > 0 && (
                    <button
                      type="button"
                      className={`list-button secondary ${theme}`}
                      onClick={() => onToggleCreateList(false)}
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
                        className={`list-item ${theme} ${list[containsPropertyName] ? 'contains-movie' : ''}`}
                        data-id={list.id}
                      >
                        <div className="list-item-info">
                          <span className="list-name">{list.name}</span>
                          <span className="movie-count-modal">
                            {list[countPropertyName] !== undefined 
                              ? `${list[countPropertyName]} ${list[countPropertyName] !== 1 ? getItemTypeNamePlural() : getItemTypeName()}` 
                              : `${list[itemsArrayPropertyName]?.length || 0} ${list[itemsArrayPropertyName]?.length !== 1 ? getItemTypeNamePlural() : getItemTypeName()}`
                            }
                          </span>
                        </div>
                        
                        {list[containsPropertyName] ? (
                          <button 
                            className="remove-movie-button-modal"
                            onClick={() => onRemoveFromList(list.id)}
                            aria-label={`Quitar ${getItemTypeName()} de esta lista`}
                          >
                            <span className="icon">🗑️</span>
                            <span>Quitar</span>
                          </button>
                        ) : (
                          <button 
                            className="add-to-list-button-modal"
                            onClick={() => onAddToList(list.id)}
                            aria-label={`Añadir ${getItemTypeName()} a esta lista`}
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
                  onClick={() => onToggleCreateList(true)}
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

export default GenericAddToListModal;