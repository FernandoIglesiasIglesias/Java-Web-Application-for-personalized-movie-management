import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserLists, createList } from "../../../backend/listService";
import { useTheme } from "../../../context/ThemeContext";
import { Errors } from "../../common";
import "./UserLists.css";

const UserLists = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar las listas del usuario al montar el componente
  useEffect(() => {
    loadUserLists();
  }, []);

  // Función para cargar las listas del usuario
  const loadUserLists = () => {
    setLoading(true);
    getUserLists(
      (fetchedLists) => {
        setLists(fetchedLists);
        setLoading(false);
      },
      (error) => {
        if (error.globalError !== "project.exceptions.EmptyUserListsException") {
          setErrors(error);
        }
        setLoading(false);
      }
    );
  };

  // Manejar el envío del formulario para crear una nueva lista
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      createList(
        newListName.trim(),
        (newList) => {
          setLists([...lists, newList]);
          setNewListName("");
          setErrors(null);
        },
        (error) => {
          setErrors(error);
        }
      );
    }
  };

  // Navegar a la página de detalle de una lista
  const handleListClick = (listId) => {
    console.log("Navegando a la lista con ID:", listId);
    navigate(`/lists/${listId}`);
  };

  return (
    <div className={`lists-container ${theme}`}>
      <h2>Mis Listas de Películas</h2>
      {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}

      {/* Formulario para crear nueva lista */}
      <form className="create-list-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Nombre de la nueva lista"
          className={theme}
        />
        <button type="submit" className={`list-button ${theme}`}>
          Crear lista
        </button>
      </form>

      {/* Mostrar listas o mensaje de carga */}
      {loading ? (
        <p className="loading-message">Cargando listas...</p>
      ) : lists.length > 0 ? (
        <div className="lists-grid">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`list-card ${theme}`}
              onClick={() => handleListClick(list.id)}
            >
              <h3>{list.name}</h3>
              <p>{list.movieCount || 0} películas</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-lists-message">No tienes listas creadas.</p>
      )}
    </div>
  );
};

export default UserLists;