import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import PersonHeader from './PersonHeader';
import PersonBio from './PersonBio';
import PersonDetails from './PersonDetails';
import './ShowPerson.css';

const ShowPerson = ({ 
  personType, 
  updatePersonData, 
  fetchPersonById,
  showAddToListButton = false,
  onAddToList,
  isAuthenticated = false
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imdbData, setImdbData] = useState(null);
  const [fetchingImdb, setFetchingImdb] = useState(false);
  const [activeTab, setActiveTab] = useState('bio'); // Para navegación por pestañas
  const dataUpdated = useRef(false);
  
  // Cargar datos de la persona
  useEffect(() => {
    const loadPerson = async () => {
      try {
        setLoading(true);
        const data = await fetchPersonById();
        
        if (!data) {
          setError(`No se encontró ${personType === 'actor' ? 'el actor' : 'el director'}`);
        } else {
          setPerson(data);
        }
        
        setLoading(false);
      } catch (error) {
        setError(`Error al cargar ${personType === 'actor' ? 'el actor' : 'el director'}: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadPerson();
  }, [personType, fetchPersonById]);
  
  useEffect(() => {
    if (!person || !person.imdbId || dataUpdated.current) return;
    
    const fetchImdbData = async () => {
      try {
        setFetchingImdb(true);
        
        // Usar una nueva API que es más fiable
        const apiEndpoint = `https://imdb232.p.rapidapi.com/api/actors/get-overview?limit=25&nm=${person.imdbId}`;
        
        const response = await fetch(apiEndpoint, {
          headers: {
            'x-rapidapi-host': 'imdb232.p.rapidapi.com',
            'x-rapidapi-key': 'cdbfa3dd29mshcd4df13fafdf647p1c3170jsn3d0e626a103b'
          }
        });
        
        if (!response.ok) {
          setFetchingImdb(false);
          return;
        }
        
        const data = await response.json();
        
        if (!data || !data.data) {
          setFetchingImdb(false);
          return;
        }
        
        setImdbData(data.data);
        
        // Actualizar nuestra base de datos con la nueva información
        updatePersonInDb(data.data);
        dataUpdated.current = true;
        
        setFetchingImdb(false);
      } catch (error) {
        console.error('Error al obtener datos de IMDB:', error);
        // No marcamos un error en la UI, simplemente terminamos silenciosamente
        setFetchingImdb(false);
      }
    };
    
    fetchImdbData();
  }, [person, updatePersonData]); 
  
  // Procesar datos de IMDB y actualizar nuestra base de datos
  const updatePersonInDb = (data) => {
    if (!data || !data.name) return;
    
    const personData = {
      id: person.id,
      name: person.name,
      imdbId: person.imdbId
    };
    
    // Extraer campos comunes
    if (data.name.primaryImage && data.name.primaryImage.url) {
      personData.imageUrl = data.name.primaryImage.url;
    }
    
    if (data.name.bio && data.name.bio.text && data.name.bio.text.plainText) {
      personData.bio = data.name.bio.text.plainText;
    }
    
    if (data.name.birthDate) {
      personData.birthDate = data.name.birthDate.date;
    }
    
    if (data.name.birthLocation && data.name.birthLocation.text) {
      personData.birthPlace = data.name.birthLocation.text;
    }
    
    if (data.name.height && data.name.height.displayableProperty && 
        data.name.height.displayableProperty.value && 
        data.name.height.displayableProperty.value.plainText) {
      personData.height = data.name.height.displayableProperty.value.plainText;
    }
    
    // Actualizar la persona en nuestra base de datos solo si hay cambios
    if (Object.keys(personData).length > 3) {
      updatePersonData(personData);
      
      // Actualizar el estado local con los nuevos datos
      setPerson(prev => ({
        ...prev,
        ...personData
      }));
    }
  };
  
  if (loading) {
    return (
      <div className={`loading-container theme-${theme}`}>
        <div className="loading-spinner"></div>
        <p>Cargando información de {personType === 'actor' ? 'actor' : 'director'}...</p>
      </div>
    );
  }
  
  if (error) {
    return <div className={`error-message theme-${theme}`}>{error}</div>;
  }
  
  if (!person) {
    return <div className={`not-found theme-${theme}`}>
      {personType === 'actor' ? 'Actor' : 'Director'} no encontrado
    </div>;
  }
  
  // Renderizar el tab seleccionado
  const renderTabContent = () => {
    switch (activeTab) {
      case 'bio':
        return <PersonBio person={person} imdbData={imdbData} loading={fetchingImdb} />;
      case 'details':
        return <PersonDetails person={person} imdbData={imdbData} loading={fetchingImdb} />;
      default:
        return <PersonBio person={person} imdbData={imdbData} loading={fetchingImdb} />;
    }
  };
  
  return (
    <div className={`person-container theme-${theme}`}>
      <div className="person-backdrop"></div>
      
      <div className="person-content-wrapper">
        <PersonHeader 
          person={person} 
          imdbData={imdbData} 
          loading={fetchingImdb} 
          personType={personType}
          showAddToListButton={showAddToListButton}
          onAddToList={onAddToList}
          isAuthenticated={isAuthenticated} 
        />
        
        <div className="person-tabs">
          <button
            className={`tab-button ${activeTab === 'bio' ? 'active' : ''}`}
            onClick={() => setActiveTab('bio')}
          >
            Biografía
          </button>
          <button
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Detalles
          </button>
        </div>
        
        <div className="person-tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ShowPerson;