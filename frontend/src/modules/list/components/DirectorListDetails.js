import React from 'react';
import { 
  getDirectorListById, 
  updateDirectorList, 
  deleteDirectorList, 
  removeDirectorFromList 
} from '../../../backend/directorListService';
import AbstractListDetails from './common/AbstractListDetails';
import ItemsGrid from './ListDetailsComponents/items/ItemsGrid';
import './ListDetailsComponents/ListDetails.css'; // Asegúrate de importar el CSS

const DirectorListDetails = () => {
  const renderDirectors = (list, theme, handleRemoveDirector, itemsIcon, noItemsMessage, noItemsSuggestion) => {
    // Asegurar que directors es un array incluso si es undefined
    const directors = list && list.directors ? list.directors : [];
        
    return (
      <ItemsGrid
        items={directors}
        itemType="director"
        theme={theme}
        onRemoveItem={handleRemoveDirector}
        emptyIcon={itemsIcon || '🎥'}
        emptyMessage={noItemsMessage || 'No hay directores en esta lista.'}
        emptySuggestion={noItemsSuggestion || 'Añade directores desde las páginas de películas seleccionando "Añadir a lista".'}
      />
    );
  };

  return (
    <AbstractListDetails
      getList={getDirectorListById}
      updateList={updateDirectorList}
      deleteList={deleteDirectorList}
      removeItemFromList={removeDirectorFromList}
      renderItems={renderDirectors}
      itemsName="directors"
      itemsIcon="🎥"
      noItemsMessage="No hay directores en esta lista."
      noItemsSuggestion="Añade directores desde las páginas de películas seleccionando 'Añadir a lista'."
      exploreLink="/directors"
      exploreLinkText="Explorar directores"
    />
  );
};

export default DirectorListDetails;