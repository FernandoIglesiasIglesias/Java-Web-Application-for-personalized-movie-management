import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import MovieExplorer from '../../movies/components/MovieExplorer';
import './Home.css';

const Home = ({ user }) => {
  const { theme } = useTheme();
  
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
      </div>
    </div>
  );
};

export default Home;