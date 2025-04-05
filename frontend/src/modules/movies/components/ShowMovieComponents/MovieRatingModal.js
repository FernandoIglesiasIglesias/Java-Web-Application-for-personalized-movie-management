import React from "react";
import { Errors } from "../../../common";
import "./MovieRatingModal.css"

const MovieRatingModal = ({ 
  theme, 
  userRating, 
  ratingValue, 
  ratingErrors, 
  ratingSuccess,
  onClose, 
  onSubmit, 
  onChange,
  onErrorClose
}) => {
  return (
    <div className="modal-overlay">
      <div className={`rating-modal ${theme}`}>
        <div className="rating-modal-header">
          <h3>{userRating ? 'Editar valoración' : 'Valorar película'}</h3>
          <button 
            className="close-modal-button" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        
        {ratingErrors && <Errors errors={ratingErrors} onClose={onErrorClose} />}
        
        {ratingSuccess && (
          <div className="rating-success-message">
            {userRating ? '¡Valoración actualizada con éxito!' : '¡Valoración guardada con éxito!'}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="rating-form">
          <div className="rating-stars-container">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
              <span 
                key={star} 
                className={`rating-star ${parseFloat(ratingValue) >= star ? 'active' : ''}`}
                onClick={() => onChange({ target: { value: star.toString() } })}
              >
                ★
              </span>
            ))}
          </div>
          
          <div className="rating-input-container">
            <div className="rating-input-group">
              <input
                type="text"
                value={ratingValue}
                onChange={onChange}
                className={`rating-input ${theme}`}
                placeholder="0-10"
                maxLength="4"
                autoFocus
              />
              <span className="rating-range">/ 10</span>
            </div>
            <p className="rating-help-text">
              Introduce un valor entre 0 y 10 (se permite un decimal)
            </p>
          </div>
          
          <div className="rating-modal-actions">
            <button 
              type="submit" 
              className={`modal-button primary ${theme}`}
              disabled={ratingValue === ""}
            >
              {userRating ? 'Actualizar valoración' : 'Guardar valoración'}
            </button>
            <button 
              type="button" 
              className={`modal-button secondary ${theme}`}
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieRatingModal;