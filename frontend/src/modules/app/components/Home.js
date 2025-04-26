import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import MovieExplorer from '../../movies/components/MovieExplorer';
import MovieRecommendations from '../../movies/components/recommendations/components/MovieRecommendations';
import './Home.css';

const Home = ({ user }) => {
  const { theme } = useTheme();
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Manejar el estado de carga de las recomendaciones
  const handleRecommendationsLoaded = useCallback((hasRecommendationsData) => {
    setRecommendationsLoaded(true); 
    setHasRecommendations(hasRecommendationsData);
  }, []);
  
  // Restablecer el estado cuando cambia el usuario
  useEffect(() => {
    if (user?.id) {
      setRecommendationsLoaded(false);
      setHasRecommendations(false);
      setLoadAttempts(prev => prev + 1);
    }
  }, [user?.id]);
  
  return (
    <div className={`home-container ${theme}`}>
      <div className="home-content">
        <div className="home-hero">
          <h1 className={`hero-title ${theme}`}>Descubre el mundo del cine</h1>
          <p className={`hero-subtitle ${theme}`}>
            Busca entre miles de películas, descubre información detallada y encuentra dónde verlas.
          </p>
        </div>
        
        <MovieExplorer user={user} />
        
        {user && (
          <div className={`recommendations-wrapper ${recommendationsLoaded ? 'has-content' : ''}`}>
            <h2 className={`section-title ${theme}`}>Recomendaciones personalizadas</h2>
            
            <MovieRecommendations 
              key={`recommendations-${user.id}-${loadAttempts}`}
              user={user} 
              onRecommendationsLoaded={handleRecommendationsLoaded} 
            />
            
            {recommendationsLoaded && !hasRecommendations && (
              <div className={`no-recommendations-guide ${theme}`}>
                <p>Aún no tenemos suficientes datos para generar recomendaciones personalizadas.</p>
                <div className="recommendation-tips">
                  <h3>Para obtener recomendaciones, puedes:</h3>
                  <ul>
                    <li>Valorar películas que hayas visto</li>
                    <li>Añadir películas a tus listas personalizadas</li>
                    <li>Buscar películas por géneros que te interesen</li>
                    <li>Explorar actores y directores de tu interés</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;