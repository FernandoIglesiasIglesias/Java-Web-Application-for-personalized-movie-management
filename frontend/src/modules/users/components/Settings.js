import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UpdateProfile from "./UpdateProfile";
import { logout } from "../../../backend/userService";
import ChangePassword from "./ChangePassword";
import './Settings.css'; // Importar el archivo CSS específico

const Settings = ({ user }) => {
    const navigate = useNavigate();

    const userName = user.userName;
    const email = user.email;
    const avatar = user.avatar;

    const [update, setUpdate] = useState(false);
    const [passwordChange, setPasswordChange] = useState(false);

    const handleLogOut = () => {
        logout();
        navigate(0);
    }

    return (
        <div className="settings-page">
            <h1>Ajustes de usuario</h1>
            <div className="settings-container">
                <div className="settings-subcontainer">
                    <h3>Avatar</h3>
                    <img src={avatar} alt="User Avatar" />
                </div>
                <div className="settings-horizontal">
                    <div className="settings-subcontainer">
                        <h3>Nombre de usuario</h3>
                        <p>{userName}</p>
                    </div>
                    <div className="settings-subcontainer">
                        <h3>Email</h3>
                        <p>{email}</p>
                    </div>
                </div>
                <div className="settings-horizontal">
                    <button className="settings-subcontainer-button" onClick={() => setUpdate(true)}>
                        Actualizar perfil
                    </button>
                    <button className="settings-subcontainer-button" onClick={() => setPasswordChange(true)}>
                        Cambiar contraseña
                    </button>
                </div>
                <div className="settings-horizontal">
                    <button className="settings-subcontainer-button red" onClick={() => handleLogOut()}>
                        Cerrar Sesion
                    </button>
                    <button className="settings-subcontainer-button grey" onClick={() => navigate(-1)}>
                        Volver
                    </button>
                </div>
            </div>

            {update && !passwordChange && <UpdateProfile user={user} onClose={() => setUpdate(false)} />}
            {passwordChange && !update && <ChangePassword user={user} onClose={() => setPasswordChange(false)} />}
        </div>
    );
}

export default Settings;