import React, { useState } from "react";
import { login, logout } from "../../../backend/userService";
import { useNavigate, Link } from "react-router-dom";
import { Errors } from "../../common";
import { useTheme } from "../../../context/ThemeContext";
import './Login.css';

const Login = ({ setAuthenticatedUser }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [backendErrors, setBackendErrors] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  let form;

  // Función para validar el formulario
  const validateForm = () => {
    const errors = {};
    
    if (!username || username.trim() === '') {
      errors.username = 'El nombre de usuario es obligatorio';
    }
    
    if (!password || password.trim() === '') {
      errors.password = 'La contraseña es obligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginError("");
    setBackendErrors(null); // Limpiar errores previos
    setIsSubmitting(true);
    
    // Validar campos obligatorios
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    if (form.checkValidity()) {
      login(
        username,
        password,
        (authenticatedUser) => {
          setAuthenticatedUser(authenticatedUser);
          navigate("/home"); 
        },
        (error) => {
          if (error.globalError) {
            // Siempre mostrar este mensaje específico para errores de login
            setLoginError("Nombre de usuario o contraseña incorrectos");
            setBackendErrors(null); // No usar el componente Errors para este caso
          } else if (error.fieldErrors && error.fieldErrors.length > 0) {
            setBackendErrors(error);
            setLoginError(""); // Limpiar el error de login si hay errores de campo
          } else {
            // Para otros errores genéricos
            setLoginError("Nombre de usuario o contraseña incorrectos");
            setBackendErrors(null);
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
  };

  // Renderizar el mensaje de error de login
  const renderLoginError = () => {
    if (!loginError) return null;
    
    return (
      <div className={`login-error-container ${theme}`}>
        <div className={`login-error-message ${theme}`}>
          <span className="error-icon">⚠️</span>
          <p>{loginError}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`auth-container ${theme}`}>
      <h1>Identificarse</h1>
      
      {/* Solo mostrar el componente Errors cuando realmente hay errores de campo específicos */}
      {backendErrors && backendErrors.fieldErrors && backendErrors.fieldErrors.length > 0 && 
        <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
      }
      
      <div className={`auth-form-container ${theme}`}>
        {renderLoginError()}
        <form ref={node => form = node} onSubmit={handleSubmit} noValidate>
          <div className="auth-form-input">
            <h3>Nombre de usuario <span className="required-field">*</span></h3>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              required
              className={`${theme} ${formErrors.username ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            {formErrors.username && <p className="field-error">{formErrors.username}</p>}
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
          <div className="auth-form-input-submit">
            <input 
              type="submit" 
              value={isSubmitting ? "Procesando..." : "Iniciar Sesión"} 
              className={theme}
              disabled={isSubmitting} 
            />
          </div>
          <p className="form-footer-note">Los campos marcados con <span className="required-field">*</span> son obligatorios</p>
          
          <div className="signup-link-container">
            <p>¿Todavía no tienes una cuenta? <Link to="/signup" className={`signup-link ${theme}`}>Regístrate</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;