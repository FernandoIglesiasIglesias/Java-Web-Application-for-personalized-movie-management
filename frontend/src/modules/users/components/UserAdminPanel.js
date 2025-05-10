import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUserByUsername } from '../../../backend/userService';
import { useTheme } from '../../../context/ThemeContext';
import './UserAdminPanel.css';

const UserAdminPanel = ({ authenticatedUser }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Verificar si el usuario es administrador
  useEffect(() => {
    if (!authenticatedUser || authenticatedUser.user.role !== 'ADMIN') {
      navigate('/home');
    }
  }, [authenticatedUser, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Limpiar mensajes de error anteriores
    setErrorMessage('');
    
    if (username.trim()) {
      // Verificar si está intentando eliminarse a sí mismo
      if (username.trim().toLowerCase() === authenticatedUser.user.userName.toLowerCase()) {
        setErrorMessage('No puedes eliminar tu propia cuenta de administrador');
        return;
      }
      setShowConfirmation(true);
    }
  };

  const handleDeleteUser = () => {
    setIsProcessing(true);
    setErrorMessage(''); // Limpiar cualquier mensaje de error previo
    
    deleteUserByUsername(
      username,
      () => {
        setSuccess(`El usuario "${username}" ha sido eliminado correctamente.`);
        setUsername('');
        setShowConfirmation(false);
        setIsProcessing(false);
        
        // Ocultar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      },
      (error) => {
        // Solo manejamos el error como un mensaje personalizado, no usamos el componente Errors
        if (error && error.globalError) {
          if (error.globalError.includes("PermissionException")) {
            setErrorMessage("No tienes permiso para eliminar este usuario.");
          } else if (error.globalError.includes("InstanceNotFoundException")) {
            setErrorMessage(`El usuario "${username}" no existe en el sistema.`);
          } else {
            setErrorMessage(`Error al eliminar el usuario: ${error.globalError}`);
          }
        } else {
          setErrorMessage("Ha ocurrido un error al intentar eliminar el usuario.");
        }
        setShowConfirmation(false);
        setIsProcessing(false);
      }
    );
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className={`admin-panel-container ${theme}`}>
      <h1>Panel de Administración</h1>
      <div className={`admin-section ${theme}`}>
        <h2>Gestión de Usuarios</h2>
        
        {success && (
          <div className={`success-message ${theme}`}>
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}
        
        {/* Mensajes de error específicos */}
        {errorMessage && (
          <div className={`error-message ${theme}`}>
            <span className="error-icon">⚠️</span>
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSearch} className="admin-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario a eliminar:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={theme}
              placeholder="Introduce el nombre de usuario"
              disabled={isProcessing}
            />
          </div>
          <button 
            type="submit" 
            className={`admin-button danger ${theme}`}
            disabled={!username.trim() || isProcessing}
          >
            {isProcessing ? "Procesando..." : "Buscar y eliminar usuario"}
          </button>
        </form>
        
        <div className="admin-info">
          <p>Esta acción eliminará al usuario y todos sus datos asociados. No se puede deshacer.</p>
        </div>
      </div>
      
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className={`confirmation-modal ${theme}`}>
            <div className="confirmation-header">
              <span className="confirmation-icon">⚠️</span>
              <h3>Confirmar eliminación</h3>
            </div>
            <div className="confirmation-content">
              <p className="confirmation-user">Usuario: <strong>{username}</strong></p>
              <div className="warning-container">
                <span className="warning-icon">⚠️</span>
                <p className="warning-text">Esta acción no se puede deshacer y eliminará todas las listas, valoraciones y datos asociados al usuario.</p>
              </div>
            </div>
            <div className="confirmation-actions">
              <button 
                className={`admin-button secondary ${theme}`}
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button 
                className={`admin-button danger ${theme}`}
                onClick={handleDeleteUser}
                disabled={isProcessing}
              >
                {isProcessing ? "Eliminando..." : "Sí, eliminar usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdminPanel;