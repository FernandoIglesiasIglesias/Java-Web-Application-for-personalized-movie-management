import React from "react";
import './Title.css';
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const Title = () => {
  const { theme } = useTheme();

  return (
    <div className={`auth-container ${theme}`}>
      <h1>TFG</h1>
      <div className="login-signup-button-container">
        <Link to="/signup">
          <button type="button" className={theme}>Registrarse</button>
        </Link>
        <Link to="/login">
          <button type="button" className={theme}>Iniciar Sesión</button>
        </Link>
      </div>
    </div>
  );
};

export default Title;