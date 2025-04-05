import React, { useState } from 'react';
import './PersonBio.css';

const PersonBio = ({ person, imdbData, loading }) => {
  const [expanded, setExpanded] = useState(false);
  
  const bio = person.bio || 
    (imdbData && imdbData.name && imdbData.name.bio ? 
      imdbData.name.bio.text.plainText : 'No hay biografía disponible.');
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="person-bio">
      <h2 className="section-title">
        <span className="icon">📝</span> Biografía
        {loading && <span className="loading-indicator-mini"></span>}
      </h2>
      
      <div className="bio-content">
        {bio.length > 400 && !expanded ? (
          <>
            <p className="bio-text">{bio.substring(0, 400)}... </p>
            <button onClick={toggleExpanded} className="read-more-btn">
              Leer más
            </button>
          </>
        ) : (
          <>
            <p className="bio-text">{bio}</p>
            {bio.length > 400 && expanded && (
              <button onClick={toggleExpanded} className="read-more-btn">
                Leer menos
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PersonBio;