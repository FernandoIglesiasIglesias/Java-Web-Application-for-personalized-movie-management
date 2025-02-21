import React, { useState } from "react";
import { updateProfile } from "../../../backend/userService";
import { uploadAvatar } from "../../../backend/uploadService";
import { Errors } from "../../common";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import './UpdateProfile.css'; // Importar el archivo CSS específico

const UpdateProfile = ({ user, onClose }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [userName, setUserName] = useState(user.userName);
    const [email, setEmail] = useState(user.email);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [backendErrors, setBackendErrors] = useState(null);
    const [avatarErrors, setAvatarErrors] = useState(null);
    let form;

    const handleOnClose = () => {
        onClose();
        navigate(0); 
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleUploadAvatar = (onSuccess, onError) => {
        if (avatar) {
            uploadAvatar(
                avatar,
                userName,
                (imageUrl) => {
                    onSuccess(imageUrl);
                },
                (error) => {
                    onError(error);
                }
            );
        } else {
            onSuccess(user.avatar);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationErrors = {
            globalError: "",
            fieldErrors: []
        };

        if (validationErrors.fieldErrors.length > 0) {
            setBackendErrors(validationErrors);
            return;
        }

        handleUploadAvatar(
            (imageUrl) => {
                if (form.checkValidity()) {
                    updateProfile(
                        {
                            id: user.id,
                            userName: userName.trim(),
                            email: email,
                            avatar: imageUrl
                        },
                        () => handleOnClose(),
                        (errors) => setBackendErrors(errors)
                    );
                } else {
                    setBackendErrors(null);
                }
            },
            (e) => { setAvatarErrors(e); }
        );
    };

    return (
        <div className={`modal ${theme}`}>
            <div className={`modal-content ${theme}`}>
                <h2>Actualizar perfil</h2>
                <form onSubmit={handleSubmit} ref={(node) => (form = node)} noValidate>
                    <div className="modal-subcontainer">
                        <h3>Nombre de usuario</h3>
                        <input
                            id="username"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            className={theme}
                        />
                    </div>
                    <div className="modal-subcontainer">
                        <h3>Email</h3>
                        <div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={theme}
                            />
                        </div>
                    </div>
                    <div className="modal-subcontainer">
                        <h3>Avatar (Sube un archivo)</h3>
                        <label htmlFor="avatar" className={theme}>Seleccionar archivo</label>
                        <input
                            type="file"
                            id="avatar"
                            onChange={(e) => handleAvatarChange(e)}
                            accept="image/*"
                        />
                        {avatarPreview && (
                            <img
                                src={avatarPreview}
                                alt="Vista previa del avatar"
                                style={{ width: "100px", height: "100px" }}
                            />
                        )}
                        {avatarErrors && <p style={{ color: "red" }}>{avatarErrors}</p>}
                    </div>
                    
                    {/* Mostrar errores justo antes del botón de Guardar Cambios */}
                    <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />

                    <button className={`settings-subcontainer-button ${theme}`} type="submit">
                        Guardar Cambios
                    </button>
                    <button className={`settings-subcontainer-button red ${theme}`} onClick={onClose}>
                        Cerrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;