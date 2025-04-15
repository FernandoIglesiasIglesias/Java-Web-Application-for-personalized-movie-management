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

  // Definimos la ruta al avatar por defecto
  const defaultAvatarPath = '/images/default-avatar.webp';

  const loadReviews = () => {
    // Si no hay ID de película, no intentamos cargar
    if (!movieId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      getMovieReviews(
        movieId,
        userId,
        (data) => {
          console.log("Reseñas cargadas:", data);
          // data siempre será un array (posiblemente vacío)
          setReviews(data);
          
          // Comprobar si el usuario actual ya ha escrito una reseña
          if (userId && data && data.length > 0) {
            const userReview = data.find(review => review.userId === parseInt(userId));
            setUserHasReviewed(!!userReview);
          } else {
            setUserHasReviewed(false);
          }
          
          setLoading(false);
        },
        (error) => {
          console.error("Error al cargar reseñas:", error);
          setReviews([]);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error no controlado al cargar reseñas:", error);
      setReviews([]);
      setLoading(false);
    }
  };

  // Funciones para manejar las votaciones de reseñas
  const handleVote = (reviewId, isHelpful) => {
    if (!authenticatedUser) {
      return;
    }
    
    console.log(`Votando en reseña ${reviewId}, es útil: ${isHelpful}`);
    
    voteReview(
      reviewId,
      isHelpful,
      (data) => {
        console.log("Voto registrado correctamente:", data);
        loadReviews(); // Recargar reseñas para mostrar los nuevos votos
      },
      (error) => {
        console.error("Error al votar:", error);
        setErrors(error);
      }
    );
  };

  const handleRemoveVote = (reviewId) => {
    if (!authenticatedUser) {
      return;
    }
    
    console.log(`Eliminando voto de reseña ${reviewId}`);
    
    removeVote(
      reviewId,
      () => {
        console.log("Voto eliminado correctamente");
        loadReviews(); // Recargar reseñas para actualizar los votos
      },
      (error) => {
        console.error("Error al eliminar voto:", error);
        setErrors(error);
      }
    );
  };

  // Función para manejar el envío de una reseña
  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!authenticatedUser) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors(null);
    
    createReview(
      {
        movieImdbId: movieId,
        title: reviewTitle,
        content: reviewContent
      },
      () => {
        setShowForm(false);
        setReviewTitle('');
        setReviewContent('');
        setSuccessMessage('¡Reseña publicada con éxito!');
        setIsSubmitting(false);
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        loadReviews();
      },
      (error) => {
        setErrors(error);
        setIsSubmitting(false);
      }
    );
  };

  // Cargamos las reseñas cuando cambia el ID de la película o el ID del usuario
  useEffect(() => {
    loadReviews();
  }, [movieId, userId]);

  return (
    <div className="movie-reviews-section">
      {/* Encabezado de las reseñas */}
      <div className="reviews-header">
        <h2>Reseñas de usuarios</h2>
        
        {/* Botón para escribir una reseña */}
        {authenticatedUser && !userHasReviewed && !showForm && (
          <button 
            className={`write-review-btn ${theme}`} 
            onClick={() => setShowForm(true)}
          >
            Escribir reseña
          </button>
        )}
      </div>
      
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className={`success-message ${theme}`}>
          {successMessage}
        </div>
      )}
      
      {/* Formulario para escribir una reseña */}
      {showForm && (
        <div className={`review-form-container ${theme}`}>
          <h3>Escribir una reseña</h3>
          
          {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}
          
          <form className={`review-form ${theme}`} onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label htmlFor="reviewTitle">Título</label>
              <input
                type="text"
                id="reviewTitle"
                value={reviewTitle}
                onChange={e => setReviewTitle(e.target.value)}
                required
                className={theme}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reviewContent">Contenido</label>
              <textarea
                id="reviewContent"
                value={reviewContent}
                onChange={e => setReviewContent(e.target.value)}
                required
                rows={5}
                className={theme}
              ></textarea>
            </div>
            
            <div className="form-buttons">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className={`review-cancel-btn ${theme}`}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`review-submit-btn ${theme}`}
              >
                {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lista de reseñas */}
      {loading ? (
        <div className="loading-reviews">
          <div className="loading-spinner"></div>
          <p>Cargando reseñas...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map(review => {
            // Verificar si la reseña pertenece al usuario actual
            const isUserReview = userId && review.userId === parseInt(userId);
            
            return (
              <div 
                key={review.id} 
                className={`review-item ${theme}`} 
                data-user-own={isUserReview ? "true" : "false"}
              >
                <div className="review-header">
                  <div className="reviewer-info">
                    <img 
                      src={review.userAvatar || defaultAvatarPath} 
                      alt={`${review.userName} avatar`} 
                      className="reviewer-avatar"
                      onError={(e) => {e.target.src = defaultAvatarPath}}
                    />
                    <div>
                      <h3 className="review-title">{review.title}</h3>
                      <Link to={`/users/${review.userId}`} className="reviewer-name">
                        {review.userName}
                      </Link>
                      <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="review-content">
                  <p className="review-text">{review.content}</p>
                </div>
                
                {/* Sección de votos */}
                {isUserReview ? (
                  <div className="review-footer">
                    <div className="user-own-review-message">
                      Esta es tu reseña - No puedes votar tus propias reseñas
                    </div>
                    <div className="review-vote-stats">
                      <div className="vote-stat">
                        <span className="vote-icon thumbs-up">👍</span> 
                        <span className="vote-count">{review.helpfulVotes || 0}</span>
                      </div>
                      <div className="vote-stat">
                        <span className="vote-icon thumbs-down">👎</span> 
                        <span className="vote-count">{review.unhelpfulVotes || 0}</span>
                      </div>
                    </div>
                  </div>
                ) : authenticatedUser && (
                  <div className="review-footer">
                    <div className="review-votes">
                      <button 
                        className={`vote-btn thumbs-up ${review.userVotedHelpful ? 'active' : ''}`}
                        onClick={() => review.userVotedHelpful 
                          ? handleRemoveVote(review.id) 
                          : handleVote(review.id, true)
                        }
                      >
                        👍 <span className="vote-count">{review.helpfulVotes || 0}</span>
                      </button>
                      <button 
                        className={`vote-btn thumbs-down ${review.userVoted && !review.userVotedHelpful ? 'active' : ''}`}
                        onClick={() => review.userVoted && !review.userVotedHelpful
                          ? handleRemoveVote(review.id) 
                          : handleVote(review.id, false)
                        }
                      >
                        👎 <span className="vote-count">{review.unhelpfulVotes || 0}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-reviews">
          No hay reseñas aún para esta película. ¡Sé el primero en escribir una!
        </div>
      )}
      
      {/* Mensaje para usuarios no logueados */}
      {!authenticatedUser && (
        <div className={`review-auth-warning ${theme}`}>
          <p>Para escribir o valorar reseñas, inicia sesión o regístrate.</p>
        </div>
      )}
    </div>
  );
};

export default MovieReviews;