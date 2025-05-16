import React from "react";
import "./LoadingState.css";

const LoadingState = ({ theme }) => {
  return (
    <div className={`movie-loading-container ${theme}`}>
      <div className="loading-spinner movie-spinner"></div>
      <p className="loading-text">Cargando detalles de la película...</p>
    </div>
  );
};

export default LoadingState;