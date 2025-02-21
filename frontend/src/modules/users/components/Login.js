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
  let form;

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {
      globalError: "",
      fieldErrors: []
    };

    if (form.checkValidity()) {
      login(
        username,
        password,
        (authenticatedUser) => {
          setAuthenticatedUser(authenticatedUser);
          navigate("/home"); // Redirigir a la página de bienvenida
        },
        (error) => {
          if (error.globalError === 'project.exceptions.IncorrectLoginException') {
            validationErrors.fieldErrors.push({
              fieldName: "Error",
              message: "Contraseña Incorrecta"
            });
          }
          setBackendErrors(validationErrors);
        },
        () => {
          navigate("/login");
          logout();
        }
      );
    } else {
      setBackendErrors(null);
    }
  };

  return (
    <div className={`auth-container ${theme}`}>
      <h1>Identificarse</h1>
      <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
      <div className={`auth-form-container ${theme}`}>
        <form ref={node => form = node} onSubmit={handleSubmit} noValidate>
          <div className="auth-form-input">
            <h3>Nombre de usuario</h3>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              required
              className={theme}
            />
          </div>
          <div className="auth-form-input">
            <h3>Contraseña</h3>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={theme}
            />
          </div>
          <div className="auth-form-input-submit">
            <input type="submit" value="Iniciar Sesion" className={theme} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;