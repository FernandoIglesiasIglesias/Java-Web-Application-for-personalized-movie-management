import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Errors } from '../../common';
import { useTheme } from '../../../context/ThemeContext';
import { signUp, logout } from '../../../backend/userService';
import { uploadAvatar } from '../../../backend/uploadService';
import './SignUp.css';

const SignUp = ({ setAuthenticatedUser }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [backendErrors, setBackendErrors] = useState(null);
  const [avatarErrors, setAvatarErrors] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  let form;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarErrors('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      // Validar formato (solo imágenes)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setAvatarErrors('Formato no admitido. Use JPG, PNG, GIF o WEBP.');
        return;
      }

      setAvatar(file);
      setAvatarErrors(null);

      // Crear URL para previsualización más eficiente
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      // Importante: limpiar URL cuando ya no se necesite
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (password !== value) {
      setPasswordsDoNotMatch(true);
    } else {
      setPasswordsDoNotMatch(false);
    }
  };

  const checkConfirmPassword = () => {
    if (password !== confirmPassword) {
      setPasswordsDoNotMatch(true);
      return false;
    }
    return true;
  };

  const handleUploadAvatar = (onSuccess, onErrors) => {
      if (avatar) {
          uploadAvatar(
              avatar,
              username,
              (data) => {
                  onSuccess(data);
              },
              (error) => {
                  // Manejo más simple y consistente del error
                  onErrors(typeof error === 'string' ? error : "Error al procesar la imagen");
              }
          );
      } else {
          onSuccess('/images/default-avatar.webp');
      }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!username || username.trim() === '') {
      errors.username = 'El nombre de usuario es obligatorio';
    }
    
    if (!password || password.trim() === '') {
      errors.password = 'La contraseña es obligatoria';
    }
    
    if (!confirmPassword || confirmPassword.trim() === '') {
      errors.confirmPassword = 'Debes confirmar tu contraseña';
    }
    
    if (!email || email.trim() === '') {
      errors.email = 'El correo electrónico es obligatorio';
    } else {
      // Validar formato de email con regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Por favor, introduce un correo electrónico válido';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    if (!checkConfirmPassword()) {
      setIsSubmitting(false);
      return;
    }

    if (form.checkValidity()) {
      if (avatar) {
        // Si hay avatar, convertirlo a base64
        uploadAvatar(
          avatar,
          username,
          (base64Image) => {
            // Ahora enviar la solicitud de registro con la imagen base64
            signUp(
              {
                userName: username,
                password: password,
                email: email,
                avatar: base64Image,
                role: "USER",
              },
              (authenticatedUser) => {
                setAuthenticatedUser(authenticatedUser);
                navigate("/home");
              },
              (error) => {
                // Manejar errores
                handleSignupError(error);
                setIsSubmitting(false);
              },
              () => {
                navigate("/login");
                logout();
                setIsSubmitting(false);
              }
            );
          },
          (error) => {
            setAvatarErrors(error);
            setIsSubmitting(false);
          }
        );
      } else {
        // Si no hay avatar, usar la imagen por defecto
        signUp(
          {
            userName: username,
            password: password,
            email: email,
            avatar: '/images/default-avatar.webp',
            role: "USER",
          },
          (authenticatedUser) => {
            setAuthenticatedUser(authenticatedUser);
            navigate("/home");
          },
          (error) => {
            handleSignupError(error);
            setIsSubmitting(false);
          },
          () => {
            navigate("/login");
            logout();
            setIsSubmitting(false);
          }
        );
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleSignupError = (error) => {
    if (error.globalError && error.globalError.includes('DuplicateInstanceException')) {
      // Verificar si el error contiene información sobre el campo específico
      if (error.fieldErrors && error.fieldErrors.length > 0) {
        // El resto del código de manejo de errores existente...
      }
    } else {
      setBackendErrors(error);
    }
  };

  return (
    <div className={`auth-container ${theme}`}>
      <h1>Registrarse</h1>
      
      {/* Mostrar errores globales con el componente Errors */}
      {backendErrors && backendErrors.globalError && (
        <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
      )}
      
      {/* Mensaje personalizado para el error de usuario duplicado */}
      {backendErrors && backendErrors.fieldErrors && backendErrors.fieldErrors.some(err => err.fieldName === "userName") && (
        <div className={`duplicate-user-error ${theme}`}>
          <span className="duplicate-user-error-icon">👤</span>
          <span>{backendErrors.fieldErrors.find(err => err.fieldName === "userName").message}</span>
        </div>
      )}
      
      {/* Mensaje personalizado para el error de email duplicado */}
      {backendErrors && backendErrors.fieldErrors && backendErrors.fieldErrors.some(err => err.fieldName === "email") && (
        <div className={`duplicate-email-error ${theme}`}>
          <span className="duplicate-error-icon">✉️</span>
          <span>{backendErrors.fieldErrors.find(err => err.fieldName === "email").message}</span>
        </div>
      )}
      
      <div className={`auth-form-container ${theme}`}>
        <form ref={node => form = node} onSubmit={handleSubmit} noValidate>
          <div className="auth-form-input">
            <h3>Nombre de usuario <span className="required-field">*</span></h3>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              required
              className={`${theme} ${(formErrors.username || (backendErrors && backendErrors.fieldErrors && backendErrors.fieldErrors.some(err => err.fieldName === "userName"))) ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            
            {/* Mostrar error de validación del campo */}
            {formErrors.username && <p className="field-error">{formErrors.username}</p>}
            
            {/* Mostrar el error específico para el campo de usuario desde el backend */}
            {backendErrors && backendErrors.fieldErrors && backendErrors.fieldErrors.some(err => err.fieldName === "userName") && (
              <p className="field-error">
                {backendErrors.fieldErrors.find(err => err.fieldName === "userName").message}
              </p>
            )}
          </div>
          <div className="auth-form-input">
            <h3>Contraseña <span className="required-field">*</span></h3>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${theme} ${formErrors.password ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {formErrors.password && <p className="field-error">{formErrors.password}</p>}
          </div>
          <div className="auth-form-input">
            <h3>Confirmar la contraseña <span className="required-field">*</span></h3>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              required
              className={`${theme} ${(passwordsDoNotMatch || formErrors.confirmPassword) ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {passwordsDoNotMatch && <p className="field-error">Las contraseñas no coinciden</p>}
            {formErrors.confirmPassword && !passwordsDoNotMatch && <p className="field-error">{formErrors.confirmPassword}</p>}
          </div>
          <div className="auth-form-input">
            <h3>Email <span className="required-field">*</span></h3>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${theme} ${(formErrors.email || (backendErrors && backendErrors.fieldErrors && backendErrors.fieldErrors.some(err => err.fieldName === "email"))) ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {formErrors.email && <p className="field-error">{formErrors.email}</p>}
            
            {/* Mostrar el error específico para el campo de email desde el backend */}
            {backendErrors && backendErrors.fieldErrors && backendErrors.fieldErrors.some(err => err.fieldName === "email") && (
              <p className="field-error">
                {backendErrors.fieldErrors.find(err => err.fieldName === "email").message}
              </p>
            )}
          </div>
          <div className="auth-form-input">
            <h3>Avatar (Opcional)</h3>
            <div className="avatar-input-container">
              <label htmlFor="avatar" className={`${theme} ${isSubmitting ? "disabled" : ""}`}>
                {avatarPreview ? "Cambiar imagen" : "Seleccionar archivo"}
              </label>
              <input
                type="file"
                id="avatar"
                onChange={(e) => handleAvatarChange(e)}
                accept="image/jpeg,image/png,image/gif,image/webp"
                disabled={isSubmitting}
              />
            </div>
            
            {avatarPreview && (
              <div className="avatar-preview-container">
                <img 
                  src={avatarPreview} 
                  alt="Vista previa del avatar" 
                  className="avatar-preview" 
                />
              </div>
            )}
            
            {avatarErrors && <p className="field-error">{avatarErrors}</p>}
            
            <p className="avatar-upload-info">
              Formatos permitidos: JPG, PNG, GIF, WEBP (máx. 5MB)
            </p>
          </div>
          <div className="auth-form-input-submit">
            <input 
              type="submit" 
              value={isSubmitting ? "Procesando..." : "Registrarse"} 
              className={theme}
              disabled={isSubmitting}
            />
          </div>
          <p className="form-footer-note">Los campos marcados con <span className="required-field">*</span> son obligatorios</p>

          <div className="login-link-container">
            <p>¿Ya tienes una cuenta? <Link to="/login" className={`login-link ${theme}`}>Iniciar sesión</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;