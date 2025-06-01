import React from "react";
import PropTypes from "prop-types";
import "./BackButton.css";

const BackButton = ({ theme, onBackClick }) => {
  return (
    <button 
      className={`back-button ${theme}`}
      onClick={onBackClick}
      aria-label="Volver atrás"
    >
      ← Volver
    </button>
  );
};

BackButton.propTypes = {
  theme: PropTypes.string.isRequired,
  onBackClick: PropTypes.func.isRequired,
};

export default BackButton;