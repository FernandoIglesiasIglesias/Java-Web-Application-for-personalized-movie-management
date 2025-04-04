import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShowPerson from './ShowPerson';
import { updateDirectorByName, getDirectorByImdbId, getDirectorByName } from '../../../backend/directorService';
import AddDirectorToListModal from '../../list/components/AddDirectorToListModal';

const ShowDirector = ({ authenticatedUser }) => {
  const { directorName } = useParams(); 
  const navigate = useNavigate();
  const [director, setDirector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  
  useEffect(() => {
    const fetchDirectorData = async () => {
      if (!directorName) {
        setError("No se proporcionó un identificador de director válido");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Determine if parameter is an IMDB ID or a name
        const isImdbId = directorName.startsWith('nm') && /^nm\d+$/.test(directorName);
        
        if (isImdbId) {
          // If it's an IMDB ID, use getDirectorByImdbId
          getDirectorByImdbId(
            directorName,
            (data) => {
              setDirector(data);
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching director by IMDB ID:', error);
              setError("No se encontró el director con el ID especificado");
              setLoading(false);
            }
          );
        } else {
          // If it's not an IMDB ID format, try by name
          getDirectorByName(
            directorName,
            (data) => {
              setDirector(data);
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching director by name:', error);
              setError("No se encontró el director especificado");
              setLoading(false);
            }
          );
        }
      } catch (error) {
        console.error('Error fetching director:', error);
        setError("Error al cargar datos del director");
        setLoading(false);
      }
    };
    
    fetchDirectorData();
  }, [directorName]);

  // Function to be passed to ShowPerson
  const fetchDirectorById = async () => {
    return director; // Just return the already loaded director data
  };

  const updateDirectorData = async (directorData) => {
    if (!directorData || !directorData.name) {
      console.error('Invalid director data for update:', directorData);
      return;
    }
    
    try {
      await updateDirectorByName(
        directorData.name,
        directorData,
        () => {
          console.log('Director updated successfully');
          // Update local state with new data
          setDirector({...director, ...directorData});
        },
        (error) => console.error('Error updating director:', error)
      );
    } catch (error) {
      console.error('Error updating director:', error);
    }
  };

  // Manejar la apertura del modal para añadir a lista
  const handleAddToList = () => {
    if (authenticatedUser) {
      setShowAddToListModal(true);
    } else {
      // Si no está autenticado, redirigir al login
      navigate('/login', { state: { from: `/directors/${directorName}` } });
    }
  };

  // Cerrar el modal
  const handleCloseAddToListModal = () => {
    setShowAddToListModal(false);
  };

  if (loading) {
    return <div className="loading-container">Localizando director...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!director) {
    return <div className="not-found-container">
      No se encontró el director: {directorName}
    </div>;
  }

  return (
    <>
      <ShowPerson 
        personType="director" 
        updatePersonData={updateDirectorData} 
        fetchPersonById={fetchDirectorById}
        showAddToListButton={true}
        onAddToList={handleAddToList}
        isAuthenticated={!!authenticatedUser}
      />
      
      {showAddToListModal && director && (
        <AddDirectorToListModal 
          director={director} 
          onClose={handleCloseAddToListModal} 
          authenticatedUser={authenticatedUser}
        />
      )}
    </>
  );
};

export default ShowDirector;