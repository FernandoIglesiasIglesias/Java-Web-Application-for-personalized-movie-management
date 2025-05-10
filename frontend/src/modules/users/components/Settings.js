import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UpdateProfile from "./UpdateProfile";
import { logout } from "../../../backend/userService";
import ChangePassword from "./ChangePassword";
import { useTheme } from "../../../context/ThemeContext";
import './Settings.css';

const Settings = ({ user , setAuthenticatedUser }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const userName = user.userName;
    const email = user.email;
    const avatar = user.avatar || "https://via.placeholder.com/150";

    const [update, setUpdate] = useState(false);
    const [passwordChange, setPasswordChange] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);

    const handleLogOut = () => {
        logout(); //
        setAuthenticatedUser(null); 
        navigate("/", { replace: true });
    }

    const handleManageLists = () => {
        navigate('/user/lists');
    }

    return (
        <div className="settings-page-wrapper">
            <div className={`settings-page ${theme}`}>
                <h1>Ajustes de usuario</h1>
                <div className={`settings-container ${theme}`}>
                    <div className="settings-subcontainer avatar-container">
                        <h3>Avatar</h3>
                        <img src={avatar} alt="Avatar de usuario" className="user-avatar-large" />
                    </div>
                    
                    <div className="settings-horizontal">
                        <div className="settings-subcontainer">
                            <h3>Nombre de usuario</h3>
                            <p className="settings-value">{userName}</p>
                        </div>
                        <div className="settings-subcontainer">
                            <h3>Email</h3>
                            <p className="settings-value">{email}</p>
                        </div>
                    </div>
                    
                    <div className="settings-section">
                        <h3>Perfil</h3>
                        <div className="settings-horizontal">
                            <button 
                                className={`settings-subcontainer-button ${theme}`} 
                                onClick={() => setUpdate(true)}
                            >
                                Actualizar perfil
                            </button>
                            <button 
                                className={`settings-subcontainer-button ${theme}`} 
                                onClick={() => setPasswordChange(true)}
                            >
                                Cambiar contraseña
                            </button>
                        </div>
                    </div>
                    
                    <div className="settings-section">
                        <h3>Contenido</h3>
                        <div className="settings-horizontal">
                            <button 
                                className={`settings-subcontainer-button ${theme}`} 
                                onClick={handleManageLists}
                            >
                                Gestionar mis listas
                            </button>
                        </div>
                    </div>
                    
                    <div className="settings-section">
                        <h3>Apariencia</h3>
                        <div className="settings-horizontal theme-toggle-container">
                            <span>Modo {theme === 'light' ? 'claro' : 'oscuro'}</span>
                            <button 
                                className={`theme-toggle-button ${theme}`}
                                onClick={toggleTheme}
                                aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
                            >
                                {theme === 'light' ? '🌙' : '☀️'}
                            </button>
                        </div>
                    </div>

                    {/* Sección de Administración agregada dentro del contenedor principal */}
                    {user.role === 'ADMIN' && (
                        <div className="settings-section">
                            <h3>Administración</h3>
                            <div className="settings-horizontal">
                                <button 
                                    className={`settings-subcontainer-button ${theme}`} 
                                    onClick={() => navigate('/admin/users')}
                                >
                                    Gestionar usuarios
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="settings-section">
                        <h3>Sesión</h3>
                        <div className="settings-horizontal">
                            <button 
                                className={`settings-subcontainer-button red ${theme}`} 
                                onClick={() => setConfirmLogout(true)}
                            >
                                Cerrar sesión
                            </button>
                            <button 
                                className={`settings-subcontainer-button grey ${theme}`} 
                                onClick={() => navigate(-1)}
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {update && <UpdateProfile user={user} onClose={() => setUpdate(false)} />}
            {passwordChange && <ChangePassword user={user} onClose={() => setPasswordChange(false)} />}
            
            {confirmLogout && (
                <div className="confirm-modal">
                    <div className={`confirm-content ${theme}`}>
                        <h3>¿Estás seguro que quieres cerrar sesión?</h3>
                        <div className="confirm-actions">
                            <button 
                                className={`settings-subcontainer-button red ${theme}`} 
                                onClick={handleLogOut}
                            >
                                Cerrar sesión
                            </button>
                            <button 
                                className={`settings-subcontainer-button ${theme}`} 
                                onClick={() => setConfirmLogout(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;