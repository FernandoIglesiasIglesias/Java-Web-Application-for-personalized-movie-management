import React from 'react';
import { 
  getActorListById, 
  updateActorList, 
  deleteActorList, 
  removeActorFromList 
} from '../../../backend/actorListService';
import AbstractListDetails from './common/AbstractListDetails';
import ItemsGrid from './ListDetailsComponents/items/ItemsGrid';
import './ListDetailsComponents/ListDetails.css'; // Asegúrate de importar el CSS

const ActorListDetails = () => {
  const renderActors = (list, theme, handleRemoveActor, itemsIcon, noItemsMessage, noItemsSuggestion) => {
    // Asegurar que actors es un array incluso si es undefined
    const actors = list && list.actors ? list.actors : [];
    
    console.log('Actors from list:', actors); // Ayuda a depurar los datos
    
    return (
      <ItemsGrid
        items={actors}
        itemType="actor"
        theme={theme}
        onRemoveItem={handleRemoveActor}
        emptyIcon={itemsIcon || '🎭'}
        emptyMessage={noItemsMessage || 'No hay actores en esta lista.'}
        emptySuggestion={noItemsSuggestion || 'Añade actores navegando a los perfiles de actores y seleccionando "Añadir a lista".'}
      />
    );
  };

  return (
    <AbstractListDetails
      getList={getActorListById}
      updateList={updateActorList}
      deleteList={deleteActorList}
      removeItemFromList={removeActorFromList}
      renderItems={renderActors}
      itemsName="actors"
      itemsIcon="🎭"
      noItemsMessage="No hay actores en esta lista."
      noItemsSuggestion="Añade actores navegando a los perfiles de actores y seleccionando 'Añadir a lista'."
      exploreLink="/actors"
      exploreLinkText="Explorar actores"
    />
  );
};

export default ActorListDetails;