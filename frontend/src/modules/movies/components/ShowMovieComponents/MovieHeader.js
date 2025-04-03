import React from "react";
import "./MovieHeader.css";

const MovieHeader = ({ theme, onBackClick }) => {
  return (
    <div className="movie-detail-nav">
      <button 
        className={`back-button ${theme}`}
        onClick={onBackClick}
        aria-label="Volver atrás"
      >
        ← Volver
      </button>
    </div>
  );
};

export default MovieHeader;