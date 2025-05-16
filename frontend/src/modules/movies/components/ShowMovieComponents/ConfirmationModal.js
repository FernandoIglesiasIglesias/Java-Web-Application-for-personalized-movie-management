import React from "react";
import "./ConfirmationModal.css"

const ConfirmationModal = ({ 
  theme, 
  title, 
  message, 
  confirmText, 
  cancelText, 
  onConfirm, 
  onCancel,
  isDanger = false
}) => {
  return (
    <div className="modal-overlay">
      <div className={`confirmation-modal ${theme}`}>
        <div className="confirmation-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="confirmation-modal-content">
          <p dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br />') }} />
        </div>
        <div className="confirmation-modal-actions">
          <button
            className={`modal-button ${isDanger ? 'danger' : 'primary'} ${theme}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className={`modal-button secondary ${theme}`}
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;