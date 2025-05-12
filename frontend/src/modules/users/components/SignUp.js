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

      // Crear URL para previsualización
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
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
        { avatar },
        (data) => {
          onSuccess(data.url);
        },
        onErrors
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
      handleUploadAvatar(
        (imageUrl) => {
          if (imageUrl) {
            signUp(
              {
                userName: username,
                password: password,
                email: email,
                avatar: imageUrl,
                role: "USER",
              },
              (authenticatedUser) => {
                setAuthenticatedUser(authenticatedUser);
                navigate("/home");
              },
              (error) => {
                // Mejorar el manejo de errores
                if (error.globalError && error.globalError.includes('DuplicateInstanceException')) {
                  // Verificar si el error contiene información sobre el campo específico
                  if (error.fieldErrors && error.fieldErrors.length > 0) {
                    // Intentar determinar qué tipo de error es basado en los campos recibidos
                    const errorField = error.fieldErrors[0].fieldName;
                    
                    if (errorField === "email" || 
                        (error.fieldErrors[0].message && 
                         (error.fieldErrors[0].message.toLowerCase().includes('correo') || 
                          error.fieldErrors[0].message.toLowerCase().includes('email')))) {
                      // Error de correo electrónico duplicado
                      setBackendErrors({
                        globalError: "",
                        fieldErrors: [
                          {
                            fieldName: "email",
                            message: "Este correo electrónico ya está en uso, por favor utiliza otro."
                          }
                        ]
                      });
                    } else {
                      // Asumir que es un error de nombre de usuario por defecto
                      setBackendErrors({
                        globalError: "",
                        fieldErrors: [
                          {
                            fieldName: "userName",
                            message: "Este nombre de usuario ya está registrado, por favor elige otro."
                          }
                        ]
                      });
                    }
                  } else {
                    // Intentar determinar el tipo de error basado en el mensaje global
                    if (error.globalError.toLowerCase().includes('correo') || 
                        error.globalError.toLowerCase().includes('email')) {
                      // Parece ser un error de correo electrónico
                      setBackendErrors({
                        globalError: "",
                        fieldErrors: [
                          {
                            fieldName: "email",
                            message: "Este correo electrónico ya está en uso, por favor utiliza otro."
                          }
                        ]
                      });
                    } else {
                      // Asumir que es un error de nombre de usuario
                      setBackendErrors({
                        globalError: "",
                        fieldErrors: [
                          {
                            fieldName: "userName",
                            message: "Este nombre de usuario ya está registrado, por favor elige otro."
                          }
                        ]
                      });
                    }
                  }
                } else if (error.globalError && error.globalError.includes('DuplicateEmailException')) {
                  // Manejar error de email duplicado explícito
                  setBackendErrors({
                    globalError: "",
                    fieldErrors: [
                      {
                        fieldName: "email",
                        message: "Este correo electrónico ya está en uso, por favor utiliza otro."
                      }
                    ]
                  });
                } else {
                  setBackendErrors(error);
                }
                setIsSubmitting(false);
              },
              () => {
                navigate("/login");
                logout();
                setIsSubmitting(false);
              }
            );
          } else {
            setBackendErrors(null);
            setIsSubmitting(false);
          }
        },
        (error) => {
          setAvatarErrors(error);
          setIsSubmitting(false);
        }
      );
    } else {
      setIsSubmitting(false);
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
            <label htmlFor="avatar" className={theme} disabled={isSubmitting}>Seleccionar archivo</label>
            <input
              type="file"
              id="avatar"
              onChange={(e) => handleAvatarChange(e)}
              accept="image/*"
              disabled={isSubmitting}
            />
            {avatarPreview && <img src={avatarPreview} alt="Vista previa del avatar" />}
            {avatarErrors && <p className="field-error">{avatarErrors}</p>}
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