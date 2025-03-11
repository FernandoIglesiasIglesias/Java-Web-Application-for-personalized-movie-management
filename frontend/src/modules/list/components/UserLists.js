import React, { useEffect, useState, useCallback } from "react";
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

  // Función para cargar las listas del usuario con useCallback para poder referirla en useEffect
  const loadUserLists = useCallback(() => {
    setLoading(true);
    getUserLists(
      (fetchedLists) => {
        console.log("Listas cargadas:", fetchedLists);
        setLists(fetchedLists);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar listas:", error);
        // Solo mostrar error si no es por listas vacías
        if (error.globalError !== "project.exceptions.EmptyUserListsException") {
          setErrors(error);
        } else {
          // Si no hay listas, inicializar con un array vacío
          setLists([]);
        }
        setLoading(false);
      }
    );
  }, []);

  // Cargar las listas al montar el componente
  useEffect(() => {
    loadUserLists();
  }, [loadUserLists]);

  // Actualizar las listas cuando la ventana obtiene el foco
  // Esto garantiza que los contadores de películas estén actualizados después de añadir películas
  useEffect(() => {
    const handleFocus = () => {
      console.log("Ventana obtuvo el foco, actualizando listas...");
      loadUserLists();
    };

    window.addEventListener('focus', handleFocus);
    
    // También podemos actualizar las listas cuando se muestra el componente
    // usando la API de Visibility Change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Documento visible, actualizando listas...");
        loadUserLists();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Limpiar los event listeners al desmontar el componente
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadUserLists]);

  // Manejar el envío del formulario para crear una nueva lista
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newListName.trim()) {
      setLoading(true); // Mostrar indicador de carga
      
      createList(
        newListName.trim(),
        (newList) => {
          // En lugar de añadir manualmente, recargar todas las listas
          // para asegurar que todos los datos estén actualizados
          loadUserLists();
          setNewListName("");
          setErrors(null);
        },
        (error) => {
          setErrors(error);
          setLoading(false);
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
          disabled={loading}
        />
        <button 
          type="submit" 
          className={`list-button ${theme}`}
          disabled={loading || !newListName.trim()}
        >
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
              {(list.movieCount > 0 || (list.movies && list.movies.length > 0)) ? (
                <p>
                  {list.movieCount !== undefined 
                    ? `${list.movieCount} película${list.movieCount !== 1 ? 's' : ''}` 
                    : `${list.movies.length} película${list.movies.length !== 1 ? 's' : ''}`
                  }
                </p>
              ) : (
                <p className="empty-list">Todavía no tienes películas añadidas</p>
              )}
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