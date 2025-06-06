import React, { useState, useEffect } from "react";
import { updateProfile } from "../../../backend/userService";
import { uploadAvatar } from "../../../backend/uploadService";
import { Errors } from "../../common";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ModalButton from "../../common/components/ModalButton";
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
    const [hasChanges, setHasChanges] = useState(false);
    let form;

    useEffect(() => {
        // Detectar cambios en los campos
        setHasChanges(
            userName.trim() !== user.userName.trim() ||
            email.trim() !== user.email.trim() ||
            avatar !== null
        );
    }, [userName, email, avatar]);

    const handleOnClose = () => {
        onClose();
        navigate(0); // Recargar la página para mostrar los cambios
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validación de tamaño
            if (file.size > 5 * 1024 * 1024) { // 5MB máximo
                setAvatarErrors("El tamaño del archivo no puede superar los 5MB");
                return;
            }

            // Validación de formato
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setAvatarErrors("Solo se permiten imágenes en formato JPG, PNG, GIF o WEBP");
                return;
            }

            setAvatar(file);

            // Generar vista previa de manera más eficiente
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setAvatarErrors(null);

            // Limpiar recurso cuando el componente se desmonte
            return () => URL.revokeObjectURL(previewUrl);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Validaciones del lado del cliente
        const validationErrors = validateForm();

        if (validationErrors.fieldErrors.length > 0) {
            setBackendErrors(validationErrors);
            setLoading(false);
            return;
        }

        if (avatar) {
            // Si hay un nuevo avatar, convertirlo a base64
            uploadAvatar(
                avatar,
                userName,
                (base64Image) => {
                    updateProfile(
                        {
                            id: user.id,
                            userName: userName.trim(),
                            email: email,
                            avatar: base64Image
                        },
                        () => {
                            setSuccess(true);
                            setTimeout(() => {
                                handleOnClose();
                            }, 1500);
                        },
                        (errors) => {
                            handleBackendErrors(errors);
                            setLoading(false);
                        }
                    );
                },
                (error) => {
                    setAvatarErrors(error);
                    setLoading(false);
                }
            );
        } else {
            // Si no hay un nuevo avatar, usar el existente
            updateProfile(
                {
                    id: user.id,
                    userName: userName.trim(),
                    email: email,
                    avatar: user.avatar || '/images/default-avatar.webp'
                },
                () => {
                    setSuccess(true);
                    setTimeout(() => {
                        handleOnClose();
                    }, 1500);
                },
                (errors) => {
                    handleBackendErrors(errors);
                    setLoading(false);
                }
            );
        }
    };

    const handleBackendErrors = (errors) => {
        if (errors.fieldErrors) {
            setBackendErrors(errors);
        } else {
            setBackendErrors({
                globalError: errors.globalError || "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo."
            });
        }
    };

    // Función auxiliar para validar el formulario
    const validateForm = () => {
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

        return validationErrors;
    };

    if (success) {
        return (
            <div className={`modal ${theme}`}>
                <div className={`modal-content ${theme}`}>
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h2>¡Perfil actualizado!</h2>
                        <p>Tu información ha sido actualizada correctamente.</p>
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
                        {backendErrors && backendErrors.fieldErrors.some(err => err.fieldName === "userName") && (
                            <p className="field-error">
                                {backendErrors.fieldErrors.find(err => err.fieldName === "userName").message}
                            </p>
                        )}
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
                            {backendErrors && backendErrors.fieldErrors.some(err => err.fieldName === "email") && (
                                <p className="field-error">
                                    {backendErrors.fieldErrors.find(err => err.fieldName === "email").message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="modal-subcontainer">
                        <h3>Avatar</h3>
                        <div className="avatar-container">
                            <div className="avatar-preview">
                                <img
                                    src={avatarPreview || user.avatar || "https://via.placeholder.com/120"}
                                    alt="Vista previa del avatar"
                                    className="avatar-image"
                                />
                            </div>
                            <div className="avatar-upload">
                                <div className="avatar-upload-actions">
                                    <label htmlFor="avatar" className="avatar-upload-button">
                                        {avatar ? "Cambiar imagen" : "Seleccionar imagen"}
                                    </label>
                                    {avatar && (
                                        <button 
                                            type="button" 
                                            className="avatar-cancel-button"
                                            onClick={() => {
                                                setAvatar(null);
                                                setAvatarPreview(user.avatar);
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="avatar"
                                    onChange={(e) => handleAvatarChange(e)}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
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
                    {backendErrors && backendErrors.globalError && (
                        <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
                    )}

                    <div className="modal-actions">
                        <ModalButton 
                            type="submit" 
                            variant="primary" 
                            theme={theme} 
                            disabled={loading || !hasChanges}
                        >
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </ModalButton>
                        <ModalButton 
                            type="button" 
                            variant="secondary" 
                            theme={theme} 
                            onClick={onClose} 
                            disabled={loading}
                        >
                            Cancelar
                        </ModalButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;