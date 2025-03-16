import React, { useState } from "react";
import { login, logout } from "../../../backend/userService";
import { useNavigate } from "react-router-dom";
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
            setLoginError("Nombre de usuario o contraseña incorrectos");
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
  };

  return (
    <div className={`auth-container ${theme}`}>
      <h1>Identificarse</h1>
      {backendErrors && <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />}
      <div className={`auth-form-container ${theme}`}>
        {loginError && (
          <div className={`login-error-message ${theme}`}>
            <span className="error-icon">⚠️</span>
            <p>{loginError}</p>
          </div>
        )}
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
        </form>
      </div>
    </div>
  );
}

export default Login;