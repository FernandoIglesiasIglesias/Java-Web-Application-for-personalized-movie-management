import React from "react";
import "./ErrorState.css";

const ErrorState = ({ error, theme, onBackClick }) => {
  return (
    <div className={`movie-error-container ${theme}`}>
      <div className="movie-error-content">
        <div className="movie-error-icon">❌</div>
        <h2>Ha ocurrido un error</h2>
        <p>{error.message || "No se pudo cargar la información de la película"}</p>
        <button 
          className={`movie-button primary ${theme}`}
          onClick={onBackClick}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default ErrorState;