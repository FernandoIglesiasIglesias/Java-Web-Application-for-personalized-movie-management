import React, { useState } from "react";
import { changePassword } from "../../../backend/userService";
import { Errors } from "../../common";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ModalButton from "../../common/components/ModalButton";
import './ChangePassword.css';

const ChangePassword = ({ user, onClose }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [backendErrors, setBackendErrors] = useState(null);
    const [formErrors, setFormErrors] = useState(''); 
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
    let form;

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors('');
        
        // Verificar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            setFormErrors('Las contraseñas no coinciden.');
            return;
        }

        if (form.checkValidity()) {
            changePassword(
                user.id,
                oldPassword,
                newPassword,
                () => setIsConfirmationVisible(true),
                (errors) => setBackendErrors(errors)
            );
        } else {
            setBackendErrors(null);
        }
    };

    if (isConfirmationVisible) {
        return (
            <div className={`modal ${theme}`}>
                <div className={`modal-content ${theme}`}>
                    <h2>¡Contraseña cambiada con éxito!</h2>
                    <p>Tu contraseña ha sido actualizada correctamente.</p>
                    <button 
                        className={`settings-subcontainer-button ${theme}`}
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`modal ${theme}`}>
            <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
            <div className={`modal-content ${theme}`}>
                <h2>Cambiar contraseña</h2>
                {formErrors && <div className="error-message">{formErrors}</div>}
                <form onSubmit={handleSubmit} ref={(node) => (form = node)} noValidate>
                    <div className={`modal-subcontainer ${theme}`}>
                        <h3>Contraseña actual</h3>
                        <input
                            id="oldPassword"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            className={theme}
                        />
                    </div>
                    <div className="modal-subcontainer">
                        <h3>Nueva contraseña</h3>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className={theme}
                        />
                    </div>
                    <div className="modal-subcontainer">
                        <h3>Confirmar nueva contraseña</h3>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={theme}
                        />
                    </div>
                    <div className="modal-actions">
                        <ModalButton 
                            type="submit" 
                            variant="primary" 
                            theme={theme}
                        >
                            Guardar cambios
                        </ModalButton>
                        <ModalButton 
                            type="button" 
                            variant="secondary" 
                            theme={theme} 
                            onClick={onClose}
                        >
                            Cancelar
                        </ModalButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;