import React, { useState } from "react";
import { updateProfile } from "../../../backend/userService";
import { uploadAvatar } from "../../../backend/uploadService";
import { Errors } from "../../common";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import './UpdateProfile.css';

const UpdateProfile = ({ user, onClose }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [userName, setUserName] = useState(user.userName);
    const [email, setEmail] = useState(user.email);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar);
    const [backendErrors, setBackendErrors] = useState(null);
    const [avatarErrors, setAvatarErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    let form;

    const handleOnClose = () => {
        onClose();
        navigate(0); // Recargar la página para mostrar los cambios
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB máximo
                setAvatarErrors("El tamaño del archivo no puede superar los 5MB");
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setAvatarErrors("Solo se permiten imágenes en formato JPG, PNG, GIF o WEBP");
                return;
            }
            
            setAvatar(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setAvatarErrors(null);
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
            onSuccess(user.avatar || '/images/default-avatar.webp');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Validaciones del lado del cliente
        const validationErrors = {
            globalError: "",
            fieldErrors: []
        };

        // Validar nombre de usuario
        if (!userName || userName.trim().length < 3) {
            validationErrors.fieldErrors.push({
                fieldName: "userName",
                message: "El nombre de usuario debe tener al menos 3 caracteres"
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            validationErrors.fieldErrors.push({
                fieldName: "email",
                message: "Por favor, introduce un email válido"
            });
        }

        if (validationErrors.fieldErrors.length > 0) {
            setBackendErrors(validationErrors);
            setLoading(false);
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
                        () => {
                            setSuccess(true);
                            setTimeout(() => {
                                handleOnClose();
                            }, 1500);
                        },
                        (errors) => {
                            setBackendErrors(errors);
                            setLoading(false);
                        }
                    );
                } else {
                    setBackendErrors(null);
                    setLoading(false);
                }
            },
            (e) => { 
                setAvatarErrors(e);
                setLoading(false);
            }
        );
    };

    if (success) {
        return (
            <div className={`modal ${theme}`}>
                <div className={`modal-content ${theme}`}>
                    <div className="success-message">
                        <h2>¡Perfil actualizado!</h2>
                        <p>Tu información ha sido actualizada correctamente.</p>
                        <div className="success-icon">✅</div>
                    </div>
                </div>
            </div>
        );
    }

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
                            disabled={loading}
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
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="modal-subcontainer">
                        <h3>Avatar</h3>
                        <div className="avatar-container">
                            <div className="avatar-preview">
                                <img
                                    src={avatarPreview || "https://via.placeholder.com/100"}
                                    alt="Vista previa del avatar"
                                    className="avatar-image"
                                />
                            </div>
                            <div className="avatar-upload">
                                <label htmlFor="avatar" className={`avatar-upload-button ${theme}`}>
                                    {avatar ? "Cambiar imagen" : "Seleccionar imagen"}
                                </label>
                                <input
                                    type="file"
                                    id="avatar"
                                    onChange={(e) => handleAvatarChange(e)}
                                    accept="image/*"
                                    disabled={loading}
                                />
                                {avatarErrors && (
                                    <p className="avatar-error">{avatarErrors}</p>
                                )}
                                <span className="avatar-help-text">
                                    Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mostrar errores del backend */}
                    {backendErrors && (
                        <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
                    )}

                    <div className="modal-actions">
                        <button 
                            className={`modal-button primary ${theme}`} 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button 
                            type="button"
                            className={`modal-button secondary ${theme}`} 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;