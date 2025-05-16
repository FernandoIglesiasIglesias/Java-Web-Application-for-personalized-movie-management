import React from 'react';
import './ListDetails.css';

const ListBottomActions = ({
  theme,
  itemsCount,
  onClearList,
  onGoBack,
  onExploreMore,
  exploreLinkPath,
  exploreLinkText,
  showExploreButton = false
}) => {
  return (
    <div className="list-bottom-actions">
      {showExploreButton && (
        <button
          className={`list-button primary ${theme}`}
          onClick={onExploreMore}
        >
          {exploreLinkText}
        </button>
      )}
      
      <button
        className={`list-button danger ${theme}`}
        onClick={onClearList}
        disabled={!itemsCount}
      >
        Vaciar lista
      </button>
      
      <button
        className={`list-button secondary ${theme}`}
        onClick={onGoBack}
      >
        Volver a mis listas
      </button>
    </div>
  );
};

export default ListBottomActions;