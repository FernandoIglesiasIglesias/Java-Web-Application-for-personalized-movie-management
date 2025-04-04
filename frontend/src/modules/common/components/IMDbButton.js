import React from "react";
import "./IMDbButton.css";

const IMDbButton = ({ 
  theme, 
  imdbId,
  entityType = "name", // "name" para personas, "title" para películas
  text = "Ver en IMDb",
  className = ""
}) => {
  const imdbUrl = `https://www.imdb.com/${entityType}/${imdbId}/`;
  
  return (
    <a
      href={imdbUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`imdb-button ${theme} ${className}`}
      aria-label={text}
    >
      <span className="button-icon imdb-icon">IMDb</span>
      <span>{text}</span>
    </a>
  );
};

export default IMDbButton;