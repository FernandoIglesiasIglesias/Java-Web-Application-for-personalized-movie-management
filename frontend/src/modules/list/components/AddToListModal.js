import React, { useEffect, useState } from "react";
import { getUserLists, addMovieToList, createList } from "../../../backend/listService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./AddToListModal.css";

const AddToListModal = ({ movie, onClose }) => {
  const { theme } = useTheme();
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState("");
  const [newListName, setNewListName] = useState("");
  const [showCreateList, setShowCreateList] = useState(false);
  const [errors, setErrors] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar las listas del usuario al montar el componente
  useEffect(() => {
    getUserLists(
      (fetchedLists) => {
        setLists(fetchedLists);
        if (fetchedLists.length > 0) {
          setSelectedList(fetchedLists[0].id);
        } else {
          setShowCreateList(true);
        }
      },
      (error) => {
        if (error.globalError === "project.exceptions.EmptyUserListsException") {
          setShowCreateList(true);
        } else {
          setErrors(error);
        }
      }
    );
  }, []);

  // Manejar la adición de la película a la lista seleccionada
  const handleAddToList = () => {
    if (selectedList) {
      addMovieToList(
        selectedList,
        movie,
        () => {
          setSuccessMessage(`Película añadida a la lista correctamente.`);
          setTimeout(() => {
            onClose();
          }, 2000);
        },
        (error) => {
          setErrors(error);
        }
      );
    }
  };

  // Manejar la creación de una nueva lista
  const handleCreateList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      createList(
        newListName.trim(),
        (newList) => {
          setLists([...lists, newList]);
          setSelectedList(newList.id);
          setNewListName("");
          setShowCreateList(false);
          setErrors(null);
        },
        (error) => {
          setErrors(error);
        }
      );
    }
  };

  return (
    <div className={`modal ${theme}`}>
      <div className={`modal-content ${theme}`}>
        <h2>Añadir a una lista</h2>
        {successMessage ? (
          <p className="success-message">{successMessage}</p>
        ) : (
          <>
            {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}
            
            {showCreateList ? (
              <form className="create-list-form" onSubmit={handleCreateList}>
                <h3>Crear nueva lista</h3>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nombre de la nueva lista"
                  className={theme}
                  required
                />
                <div className="modal-buttons">
                  <button type="submit" className={`list-button ${theme}`}>
                    Crear y seleccionar
                  </button>
                  {lists.length > 0 && (
                    <button
                      type="button"
                      className={`list-button ${theme}`}
                      onClick={() => setShowCreateList(false)}
                    >
                      Usar lista existente
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div>
                <h3>Seleccionar lista existente</h3>
                <select
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className={theme}
                >
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
                <div className="modal-buttons">
                  <button
                    className={`list-button ${theme}`}
                    onClick={handleAddToList}
                  >
                    Añadir a esta lista
                  </button>
                  <button
                    className={`list-button ${theme}`}
                    onClick={() => setShowCreateList(true)}
                  >
                    Crear nueva lista
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        <button
          className={`list-button red ${theme}`}
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default AddToListModal;