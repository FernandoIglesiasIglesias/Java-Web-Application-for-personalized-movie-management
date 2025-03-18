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

  // Función para cargar las listas del usuario
  const loadUserLists = useCallback(() => {
    setLoading(true);
    getUserLists(
      (fetchedLists) => {
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
  useEffect(() => {
    const handleFocus = () => {
      loadUserLists();
    };

    window.addEventListener('focus', handleFocus);
    
    // También actualizar cuando el documento se hace visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
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
        () => {
          // Recargar todas las listas para asegurar que todos los datos estén actualizados
          loadUserLists();
          setNewListName("");
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
    navigate(`/lists/${listId}`);
  };

  return (
    <div className="user-lists-page">
      <div className={`lists-container ${theme}`}>
        <header className="lists-header">
          <h1>Mis Listas de Películas</h1>
          <p className="lists-description">
            Organiza tus películas favoritas en listas personalizadas
          </p>
        </header>
        
        {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}

        {/* Formulario para crear nueva lista */}
        <div className="create-list-section">
          <h2>Crear nueva lista</h2>
          <form className="create-list-form" onSubmit={handleSubmit}>
            <div className="input-group">
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
                className={`list-button primary ${theme}`}
                disabled={loading || !newListName.trim()}
              >
                {loading ? "Creando..." : "Crear lista"}
              </button>
            </div>
          </form>
        </div>

        {/* Mostrar listas o mensaje de carga */}
        <div className="lists-content">
          <h2>Mis listas</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-message">Cargando tus listas...</p>
            </div>
          ) : lists.length > 0 ? (
            // Renderizar las tarjetas directamente, sin el contenedor .lists-grid
            lists.map((list) => (
              <div
                key={list.id}
                className={`list-card ${theme}`}
                onClick={() => handleListClick(list.id)}
              >
                <div className="list-card-inner">
                  <h3>{list.name}</h3>
                  <div className="list-card-footer">
                    {(list.movieCount > 0 || (list.movies && list.movies.length > 0)) ? (
                      <span className="movie-count">
                        {list.movieCount !== undefined 
                          ? `${list.movieCount} película${list.movieCount !== 1 ? 's' : ''}` 
                          : `${list.movies.length} película${list.movies.length !== 1 ? 's' : ''}`
                        }
                      </span>
                    ) : (
                      <span className="empty-list">Lista vacía</span>
                    )}
                    <span className="view-list">Ver lista →</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-lists-container">
              <div className="no-lists-icon">📋</div>
              <p className="no-lists-message">No tienes listas creadas.</p>
              <p className="no-lists-suggestion">
                Crea tu primera lista para empezar a guardar tus películas favoritas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLists;