import React from "react";
import PropTypes from "prop-types";
import "./ModalButton.css";

const ModalButton = ({ type = "button", variant = "primary", disabled = false, onClick, children, theme }) => {
  return (
    <button
      type={type}
      className={`modal-button ${variant} ${theme}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

ModalButton.propTypes = {
  type: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  theme: PropTypes.string.isRequired,
};

export default ModalButton;