import React from 'react';
import './PersonDetails.css';

const PersonDetails = ({ person, imdbData, loading }) => {
  // Formatear fecha de nacimiento para mostrarla de forma agradable
  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Obtener información de edad
  const getAge = () => {
    if (!person.birthDate) return 'Desconocida';
    
    const birthDate = new Date(person.birthDate);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} años`;
  };
  
  // Obtener nacionalidad desde el lugar de nacimiento
  const getNationality = () => {
    if (!person.birthPlace) return 'Desconocida';
    
    // Intenta extraer el país del lugar de nacimiento
    const parts = person.birthPlace.split(',');
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1].trim();
      return lastPart;
    }
    return 'Desconocida';
  };
  
  // Obtener información de cónyuges si está disponible
  const getSpouses = () => {
    if (imdbData?.name?.spouses && imdbData.name.spouses.length > 0) {
      return imdbData.name.spouses.map((spouse, index) => (
        <div key={index} className="spouse-card">
          <div className="spouse-header">
            <span className="spouse-name">{spouse.spouse.asMarkdown.plainText}</span>
            {spouse.current && <span className="spouse-status current">Actual</span>}
            {!spouse.current && <span className="spouse-status past">Anterior</span>}
          </div>
          <div className="spouse-details">
            {spouse.timeRange?.displayableProperty && (
              <div className="spouse-timerange">
                {spouse.timeRange.displayableProperty.value.plainText}
              </div>
            )}
            
            {spouse.attributes && spouse.attributes.length > 0 && (
              <div className="spouse-attributes">
                {spouse.attributes.map((attr, i) => (
                  <span key={i} className="spouse-attribute">{attr.text}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ));
    }
    
    return <p className="no-data">No hay información disponible</p>;
  };

  // Obtener otros nombres o apodos
  const getAliasNames = () => {
    if (imdbData?.name?.akas && imdbData.name.akas.edges && imdbData.name.akas.edges.length > 0) {
      return (
        <div className="alias-names">
          {imdbData.name.akas.edges.map((alias, index) => (
            <span key={index} className="alias-tag">{alias.node.text}</span>
          ))}
        </div>
      );
    }
    return null;
  };

  // Obtener nombre de nacimiento
  const getBirthName = () => {
    if (imdbData?.name?.birthName && imdbData.name.birthName.text) {
      return imdbData.name.birthName.text;
    }
    return null;
  };

  // Renderizar enlaces oficiales y redes sociales
  const renderOfficialLinks = () => {
    if (!imdbData?.name?.officialLinks?.edges || imdbData.name.officialLinks.edges.length === 0) {
      return <p className="no-data">No hay enlaces disponibles</p>;
    }
    
    return (
      <div className="social-links-grid">
        {imdbData.name.officialLinks.edges.map((link, index) => (
          <a 
            key={index}
            href={link.node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            {determineSocialIcon(link.node.url)}
            {link.node.label}
          </a>
        ))}
      </div>
    );
  };
  
  return (
    <div className="person-details">
      <div className="details-grid">
        <div className="details-column">
          <div className="details-item">
            <h3>Fecha de nacimiento</h3>
            <p>{person.birthDate ? formatDate(person.birthDate) : 'Desconocida'}</p>
          </div>
          
          <div className="details-item">
            <h3>Edad</h3>
            <p>{getAge()}</p>
          </div>
          
          <div className="details-item">
            <h3>Lugar de nacimiento</h3>
            <p>{person.birthPlace || 'Desconocido'}</p>
          </div>
          
          <div className="details-item">
            <h3>Nacionalidad</h3>
            <p>{getNationality()}</p>
          </div>
          
          {person.height && (
            <div className="details-item">
              <h3>Altura</h3>
              <p>{person.height}</p>
            </div>
          )}
          
          {getBirthName() && (
            <div className="details-item">
              <h3>Nombre de nacimiento</h3>
              <p>{getBirthName()}</p>
            </div>
          )}
          
          {getAliasNames() && (
            <div className="details-item details-item-full">
              <h3>También conocido como</h3>
              {getAliasNames()}
            </div>
          )}
        </div>
      </div>
      
      {/* Sección unificada de redes sociales y enlaces oficiales */}
      {imdbData?.name?.officialLinks?.edges && imdbData.name.officialLinks.edges.length > 0 && (
        <div className="social-section">
          <h3 className="subsection-title">Redes sociales y enlaces oficiales</h3>
          {renderOfficialLinks()}
        </div>
      )}
      
      {/* Sección de parejas y matrimonios */}
      {imdbData?.name?.spouses && imdbData.name.spouses.length > 0 && (
        <div className="spouses-section">
          <h3 className="subsection-title">Parejas y matrimonios</h3>
          <div className="spouses-grid">
            {getSpouses()}
          </div>
        </div>
      )}
    </div>
  );
};

// Función para determinar el icono según la URL
function determineSocialIcon(url) {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('facebook')) {
    return <i className="fab fa-facebook social-icon facebook"></i>;
  } else if (lowerUrl.includes('instagram')) {
    return <i className="fab fa-instagram social-icon instagram"></i>;
  } else if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) {
    return <i className="fab fa-x-twitter social-icon twitter"></i>;
  } else if (lowerUrl.includes('youtube')) {
    return <i className="fab fa-youtube social-icon youtube"></i>;
  } else if (lowerUrl.includes('tiktok')) {
    return <i className="fab fa-tiktok social-icon tiktok"></i>;
  } else if (lowerUrl.includes('snapchat')) {
    return <i className="fab fa-snapchat social-icon snapchat"></i>;
  } else if (lowerUrl.includes('myspace')) {
    return <i className="fab fa-myspace social-icon myspace"></i>;
  } else if (lowerUrl.includes('linkedin')) {
    return <i className="fab fa-linkedin social-icon linkedin"></i>;
  } else {
    return <i className="fas fa-globe social-icon website"></i>;
  }
}

export default PersonDetails;