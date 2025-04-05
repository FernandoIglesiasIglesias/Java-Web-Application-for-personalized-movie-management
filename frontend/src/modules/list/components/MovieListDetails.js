import React from 'react';
import { 
  getListById, 
  updateList, 
  deleteList, 
  removeMovieFromList 
} from '../../../backend/listService';
import AbstractListDetails from './common/AbstractListDetails';
import ItemsGrid from './ListDetailsComponents/items/ItemsGrid';
import './ListDetailsComponents/ListDetails.css';

const MovieListDetails = () => {
  const renderMovies = (list, theme, handleRemoveMovie, itemsIcon, noItemsMessage, noItemsSuggestion) => {
    return (
      <ItemsGrid
        items={list?.movies || []}
        itemType="movie"
        theme={theme}
        onRemoveItem={handleRemoveMovie}
        emptyIcon={itemsIcon || '🎬'}
        emptyMessage={noItemsMessage || 'No hay películas en esta lista.'}
        emptySuggestion={noItemsSuggestion || 'Añade películas navegando al explorador de películas y seleccionando "Añadir a lista".'}
      />
    );
  };

  return (
    <AbstractListDetails
      getList={getListById}
      updateList={updateList}
      deleteList={deleteList}
      removeItemFromList={removeMovieFromList}
      renderItems={renderMovies}
      itemsName="movies"
      itemsIcon="🎬"
      noItemsMessage="No hay películas en esta lista."
      noItemsSuggestion="Añade películas navegando al explorador de películas y seleccionando 'Añadir a lista'."
      exploreLink="/movies"
      exploreLinkText="Explorar películas"
    />
  );
};

export default MovieListDetails;