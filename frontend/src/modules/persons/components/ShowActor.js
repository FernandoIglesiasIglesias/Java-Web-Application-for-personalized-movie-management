import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShowPerson from './ShowPerson';
import { updateActorByName, getActorByImdbId, getActorByName, createActor } from '../../../backend/actorService';
import AddActorToListModal from '../../list/components/modals/AddActorToListModal';

const ShowActor = ({ authenticatedUser }) => {
  const { actorName } = useParams(); 
  const navigate = useNavigate();
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  
  useEffect(() => {
    const fetchActorData = async () => {
      if (!actorName) {
        setError("No se proporcionó un identificador de actor válido");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Determine if parameter is an IMDB ID or a name
        const isImdbId = actorName.startsWith('nm') && /^nm\d+$/.test(actorName);
        
        if (isImdbId) {
          // If it's an IMDB ID, try to get from our database first
          getActorByImdbId(
            actorName,
            (data) => {
              setActor(data);
              setLoading(false);
            },
            (error) => {              
              // Crear un nuevo actor con datos mínimos
              const newActor = {
                name: "Actor", // Nombre genérico temporal
                imdbId: actorName,
                firstName: "Actor"
              };
              
              createActor(
                newActor,
                (createdActor) => {
                  // Actor creado, ahora lo podemos usar
                  setActor(createdActor);
                  setLoading(false);
                },
                (createError) => {
                  console.error('Error al crear el actor:', createError);
                  setError("No se pudo crear el actor con el ID especificado");
                  setLoading(false);
                }
              );
            }
          );
        } else {
          // If it's not an IMDB ID format, try by name
          getActorByName(
            actorName,
            (data) => {
              setActor(data);
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching actor by name:', error);
              setError("No se encontró el actor especificado");
              setLoading(false);
            }
          );
        }
      } catch (error) {
        console.error('Error fetching actor:', error);
        setError("Error al cargar datos del actor");
        setLoading(false);
      }
    };
    
    fetchActorData();
  }, [actorName]);

  // Function to be passed to ShowPerson
  const fetchActorById = async () => {
    return actor; // Just return the already loaded actor data
  };

  const updateActorData = async (actorData) => {
    if (!actorData || !actorData.name) {
      console.error('Invalid actor data for update:', actorData);
      return;
    }
    
    try {
      await updateActorByName(
        actorData.name,
        actorData,
        () => {
          // Update local state with new data
          setActor({...actor, ...actorData});
        },
        (error) => console.error('Error updating actor:', error)
      );
    } catch (error) {
      console.error('Error updating actor:', error);
    }
  };

  // Manejar la apertura del modal para añadir a lista
  const handleAddToList = () => {
    if (authenticatedUser) {
      setShowAddToListModal(true);
    } else {
      // Si no está autenticado, redirigir al login
      navigate('/login', { state: { from: `/actors/${actorName}` } });
    }
  };

  // Cerrar el modal
  const handleCloseAddToListModal = () => {
    setShowAddToListModal(false);
  };

  if (loading) {
    return <div className="loading-container">Localizando actor...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!actor) {
    return <div className="not-found-container">
      No se encontró el actor: {actorName}
    </div>;
  }

  return (
    <>
      <ShowPerson 
        personType="actor" 
        updatePersonData={updateActorData} 
        fetchPersonById={fetchActorById}
        showAddToListButton={true}
        onAddToList={handleAddToList}
        isAuthenticated={!!authenticatedUser}
      />
      
      {showAddToListModal && actor && (
        <AddActorToListModal 
          actor={actor} 
          onClose={handleCloseAddToListModal} 
          authenticatedUser={authenticatedUser}
        />
      )}
    </>
  );
};

export default ShowActor;