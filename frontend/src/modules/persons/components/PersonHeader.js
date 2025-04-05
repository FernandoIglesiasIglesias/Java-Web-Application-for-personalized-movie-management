import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import AddToListButton from "../../common/components/AddToListButton";
import IMDbButton from "../../common/components/IMDbButton";
import './PersonHeader.css';

const PersonHeader = ({ 
  person, 
  imdbData, 
  loading, 
  personType,
  showAddToListButton,
  onAddToList,
  isAuthenticated
}) => {
  const { theme } = useTheme();
  
  // Obtener la URL de la imagen
  const imageUrl = person.imageUrl || 
    (imdbData && imdbData.name && imdbData.name.primaryImage ? 
      imdbData.name.primaryImage.url : '/images/placeholder-person.jpg');
  
  // Formatear fecha de nacimiento
  const formatBirthDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Calcular edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    
    if (now.getMonth() < birth.getMonth() || 
        (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const birthPlace = person.birthPlace || 
    (imdbData?.name?.birthLocation?.text) || null;
    
  const birthDate = person.birthDate || 
    (imdbData?.name?.birthDate?.date) || null;
    
  const age = birthDate ? calculateAge(birthDate) : null;
  
  return (
    <div className={`person-header theme-${theme}`} style={{backgroundImage: `url(${imageUrl})`}}>
      <div className="person-header-overlay"></div>
      
      <div className="person-header-content">
        <div className="person-image-wrapper">
          <div className="person-image-container">
            <img 
              src={imageUrl} 
              alt={person.name} 
              className="person-image" 
              onError={(e) => {e.target.src = '/images/placeholder-person.jpg'}}
            />
          </div>
        </div>
        
        <div className="person-header-info">
          <div className="person-header-main">
            <h1>{person.name}</h1>
            
            <div className="person-badges">
              <span className="person-type-badge">
                {personType === 'actor' ? 'Actor' : 'Director'}
              </span>
              
              {birthDate && (
                <span className="person-age-badge" title={formatBirthDate(birthDate)}>
                  {age} años
                </span>
              )}
              
              {birthPlace && (
                <span className="person-country-badge">
                  {birthPlace.split(',').pop().trim()}
                </span>
              )}
            </div>
            
            <div className="person-header-actions">
              {showAddToListButton && (
                <AddToListButton
                  theme={theme}
                  onClick={onAddToList}
                  disabled={!isAuthenticated}
                  tooltipText={!isAuthenticated ? "Inicia sesión para añadir a listas" : ""}
                  text={personType === 'actor' ? 'Añadir actor a lista' : 'Añadir director a lista'}
                  className="header-button"
                />
              )}
              
              {person.imdbId && (
                <IMDbButton
                  theme={theme}
                  imdbId={person.imdbId}
                  entityType="name"
                  className="header-button"
                />
              )}
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="updating-info-badge">
            <span className="spinner"></span>
            <span>Actualizando información...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonHeader;