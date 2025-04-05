import React from 'react';
import './ListDetails.css';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  theme
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className={`confirm-modal ${theme}`}>
        <span className="confirm-icon">⚠️</span>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button
            className={`list-button danger ${theme}`}
            onClick={onConfirm}
          >
            {confirmText || 'Confirmar'}
          </button>
          <button
            className={`list-button secondary ${theme}`}
            onClick={onCancel}
          >
            {cancelText || 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;