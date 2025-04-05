import React from 'react';
import './ListDetails.css';

const ListHeader = ({ 
  list, 
  editMode, 
  listName, 
  setListName, 
  theme, 
  onUpdateList, 
  setEditMode, 
  onShowDeleteConfirm
}) => {
  return (
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
              onClick={onUpdateList}
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
              onClick={onShowDeleteConfirm}
            >
              Eliminar lista
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ListHeader;