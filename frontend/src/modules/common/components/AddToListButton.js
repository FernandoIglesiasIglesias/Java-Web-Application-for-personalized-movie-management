import React from "react";
import "./AddToListButton.css";

const AddToListButton = ({ 
  theme, 
  onClick, 
  disabled = false, 
  tooltipText,
  text = "Añadir a lista",
  className = ""
}) => {
  return (
    <button
      className={`add-to-list-button ${theme} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltipText}
      aria-label={text}
    >
      <span className="button-icon">+</span>
      <span>{text}</span>
    </button>
  );
};

export default AddToListButton;