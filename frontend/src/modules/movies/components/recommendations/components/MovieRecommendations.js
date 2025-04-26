import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations, recordMovieView } from '../../../../../backend/recommendationService';
import { useTheme } from '../../../../../context/ThemeContext';
import MovieGrid from '../../explorer/MovieGrid';
import './MovieRecommendations.css';

const MovieRecommendations = ({ user, onRecommendationsLoaded }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar las recomendaciones
  const loadRecommendations = useCallback(() => {
    if (!user) {
      setLoading(false);
      if (onRecommendationsLoaded) onRecommendationsLoaded(false);
      return;
    }
    
    setLoading(true);
    getRecommendations(
      10, // Obtener 10 recomendaciones
      (data) => {
        // Verificar y preparar los datos para el formato que espera MovieGrid
        const processedData = Array.isArray(data) ? data.map(movie => ({
          id: typeof movie.id === 'object' ? movie.id.id || movie.id.toString() : movie.id,
          imdbId: movie.imdbId,
          title: movie.title || 'Sin título',
          posterUrl: movie.posterUrl || movie.verticalPoster || movie.imageUrl,
          year: movie.releaseYear || movie.year,
          rating: movie.imdbRating || movie.rating,
          userRating: movie.averageRating,
          genres: Array.isArray(movie.genres) ? 
            movie.genres.map(g => typeof g === 'object' ? g.name : g) : []
        })) : [];
        
        setRecommendations(processedData);
        setLoading(false);
        setError(null);
        
        // Notificar al componente padre si tenemos recomendaciones
        if (onRecommendationsLoaded) {
          onRecommendationsLoaded(processedData && processedData.length > 0);
        }
      },
      (error) => {
        console.error("Error al cargar recomendaciones:", error);
        setError("No pudimos cargar tus recomendaciones personalizadas");
        setLoading(false);
        setRecommendations([]);
        
        // Notificar que no hay recomendaciones válidas
        if (onRecommendationsLoaded) {
          onRecommendationsLoaded(false);
        }
      }
    );
  }, [user, onRecommendationsLoaded]);

  // Cargar recomendaciones al montar el componente y cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [loadRecommendations, user]);

  // Función para manejar el clic en una película
  const handleMovieClick = useCallback((imdbId) => {
    if (!imdbId) return;
    
    // Registrar la visualización en el sistema de recomendaciones
    recordMovieView(
      imdbId,
      () => console.log("Visualización registrada para recomendaciones"),
      (error) => console.error("Error al registrar visualización:", error)
    );
    
    // Navegar a la página de detalles de la película
    navigate(`/movies/${imdbId}`);
  }, [navigate]);

  // Si está cargando, mostrar el spinner
  if (loading) {
    return (
      <div className={`movie-recommendations ${theme}`}>
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Preparando tus recomendaciones personalizadas...</p>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje de error con botón para reintentar
  if (error) {
    return (
      <div className={`movie-recommendations ${theme}`}>
        <div className={`recommendations-error ${theme}`}>
          <p>{error}</p>
          <button 
            onClick={loadRecommendations}
            className={`retry-button ${theme}`}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Solo mostrar el componente si hay recomendaciones
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`movie-recommendations ${theme}`}>
      <h3 className="recommendations-title">Recomendaciones para ti</h3>
      <div className="recommendations-grid-container">
        <MovieGrid 
          movies={recommendations}
          onMovieClick={handleMovieClick}
          theme={theme}
          source="recommendations"
        />
      </div>
    </div>
  );
};

export default MovieRecommendations;