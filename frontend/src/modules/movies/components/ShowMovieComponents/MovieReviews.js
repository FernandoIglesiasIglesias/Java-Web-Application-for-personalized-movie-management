import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMovieReviews, createReview, voteReview, removeVote } from '../../../../backend/reviewService';
import { useTheme } from '../../../../context/ThemeContext';
import { Errors } from '../../../common';
import './MovieReviews.css';

// En lugar de importar el contexto de autenticación, vamos a recibir el usuario como prop
const MovieReviews = ({ movieId, authenticatedUser }) => {
  const { theme } = useTheme();
  const userId = authenticatedUser?.user?.id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Definimos la ruta al avatar por defecto en lugar de importarlo
  const defaultAvatarPath = '/images/default-avatar.webp';

  // Cargar reseñas de la película
  const loadReviews = () => {
    setLoading(true);
    getMovieReviews(
      movieId,
      (data) => {
        setReviews(data);
        // Comprobar si el usuario actual ya ha escrito una reseña
        if (userId) {
          const userReview = data.find(review => review.userId === userId);
          setUserHasReviewed(!!userReview);
        }
        setLoading(false);
      },
      (error) => {
        setErrors(error);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    loadReviews();
  }, [movieId, userId]);

  // Manejar la creación de una reseña
  const handleSubmitReview = (e) => {
    e.preventDefault();
    setErrors(null);
    setIsSubmitting(true);

    // Validación básica
    if (!reviewTitle.trim() || !reviewContent.trim()) {
      setErrors({ globalError: "El título y el contenido de la reseña son obligatorios" });
      setIsSubmitting(false);
      return;
    }

    const reviewData = {
      movieImdbId: movieId,
      title: reviewTitle,
      content: reviewContent
    };

    createReview(
      reviewData,
      (data) => {
        setReviewTitle('');
        setReviewContent('');
        setIsSubmitting(false);
        setShowForm(false);
        setSuccessMessage('¡Reseña publicada con éxito!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadReviews(); // Recargar las reseñas
      },
      (error) => {
        setErrors(error);
        setIsSubmitting(false);
      }
    );
  };

  // Manejar el voto de una reseña
  const handleVote = (reviewId, isHelpful, currentVote) => {
    if (!authenticatedUser) {
      return;
    }

    // Si ya ha votado y vuelve a hacer clic en el mismo botón, eliminar el voto
    if (currentVote !== null && currentVote === isHelpful) {
      removeVote(
        reviewId,
        () => {
          loadReviews(); // Recargar las reseñas para actualizar los votos
        },
        (error) => setErrors(error)
      );
    } else {
      // Si no ha votado o cambia su voto, añadir/actualizar el voto
      voteReview(
        reviewId,
        isHelpful,
        () => {
          loadReviews(); // Recargar las reseñas para actualizar los votos
        },
        (error) => setErrors(error)
      );
    }
  };

  // Renderizar un mensaje de aviso para usuarios no autenticados
  const renderAuthWarning = () => {
    if (!authenticatedUser) {
      return (
        <div className={`review-auth-warning ${theme}`}>
          <p>
            <Link to="/login" className="login-link">Inicia sesión</Link> o 
            <Link to="/signup" className="signup-link"> regístrate</Link> para escribir reseñas y votar.
          </p>
        </div>
      );
    }
    return null;
  };

  // Renderizar el formulario para crear una reseña
  const renderReviewForm = () => {
    if (!authenticatedUser || !showForm) {
      return null;
    }

    return (
      <div className={`review-form-container ${theme}`}>
        <h3>Escribe tu reseña</h3>
        {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}
        <form onSubmit={handleSubmitReview} className="review-form">
          <div className="form-group">
            <label htmlFor="reviewTitle">Título:</label>
            <input
              type="text"
              id="reviewTitle"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Escribe un título descriptivo"
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reviewContent">Contenido:</label>
            <textarea
              id="reviewContent"
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Comparte tu opinión sobre la película"
              rows={5}
              maxLength={2000}
              required
            />
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              className={`review-submit-btn ${theme}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publicando..." : "Publicar reseña"}
            </button>
            <button
              type="button"
              className={`review-cancel-btn ${theme}`}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Renderizar una reseña individual
  const renderReview = (review) => {
    const reviewDate = new Date(review.createdAt);
    const formattedDate = reviewDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Determinar si el usuario actual ya ha votado esta reseña
    const userVoted = review.userVoted || false;
    const userVotedHelpful = review.userVotedHelpful;
    const isOwnReview = userId && review.userId === userId;

    return (
      <div key={review.id} className={`review-item ${theme}`} data-user-own={isOwnReview}>
        <div className="review-header">
          <div className="reviewer-info">
            <img 
              src={review.userAvatar || defaultAvatarPath} 
              alt={`Avatar de ${review.userName}`} 
              className="reviewer-avatar" 
              onError={(e) => {e.target.src = defaultAvatarPath}}
            />
            <div>
              <h4 className="reviewer-name">{review.userName}</h4>
              <span className="review-date">{formattedDate}</span>
            </div>
          </div>
        </div>
        <div className="review-content">
          <h3 className="review-title">{review.title}</h3>
          <p className="review-text">{review.content}</p>
        </div>
        <div className="review-footer">
          <div className="review-votes">
            <button
              className={`vote-btn thumbs-up ${userVoted && userVotedHelpful ? 'active' : ''} ${!authenticatedUser ? 'disabled' : ''}`}
              onClick={() => authenticatedUser && handleVote(review.id, true, userVoted && userVotedHelpful ? true : null)}
              disabled={!authenticatedUser || review.userId === userId}
              title={review.userId === userId ? "No puedes votar tu propia reseña" : ""}
            >
              <i className="fas fa-thumbs-up"></i>
              <span className="vote-count">{review.helpfulVotes || 0}</span>
            </button>
            <button
              className={`vote-btn thumbs-down ${userVoted && userVotedHelpful === false ? 'active' : ''} ${!authenticatedUser ? 'disabled' : ''}`}
              onClick={() => authenticatedUser && handleVote(review.id, false, userVoted && userVotedHelpful === false ? false : null)}
              disabled={!authenticatedUser || review.userId === userId}
              title={review.userId === userId ? "No puedes votar tu propia reseña" : ""}
            >
              <i className="fas fa-thumbs-down"></i>
              <span className="vote-count">{review.unhelpfulVotes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`movie-reviews-container ${theme}`}>
      <div className="reviews-header">
        <h2>Reseñas de usuarios</h2>
        
        {authenticatedUser && !userHasReviewed && !showForm && (
          <button
            className={`write-review-btn ${theme}`}
            onClick={() => setShowForm(true)}
          >
            Escribir reseña
          </button>
        )}
      </div>

      {successMessage && (
        <div className={`success-message ${theme}`}>
          {successMessage}
        </div>
      )}

      {renderAuthWarning()}
      {renderReviewForm()}

      {loading ? (
        <div className="loading-reviews">
          <div className="loading-spinner"></div>
          <p>Cargando reseñas...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No hay reseñas para esta película. ¡Sé el primero en compartir tu opinión!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => renderReview(review))}
        </div>
      )}
    </div>
  );
};

export default MovieReviews;