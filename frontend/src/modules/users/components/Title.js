import React from "react";
import './Title.css';
import { Link } from "react-router-dom";

const Title = () => {
  return (
    <div className="auth-container">
      <h1>TFG</h1>
      <div className="login-signup-button-container">
        <Link to="/signup">
          <button type="button">Registrarse</button>
        </Link>
        <Link to="/login">
          <button type="button">Iniciar Sesión</button>
        </Link>
      </div>
    </div>
  );
};

export default Title;