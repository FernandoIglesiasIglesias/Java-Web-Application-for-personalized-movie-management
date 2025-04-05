import React from 'react';
import EmptyListMessage from '../../common/EmptyListMessage';
import MovieItem from './MovieItem';
import ActorItem from './ActorItem';
import DirectorItem from './DirectorItem';
import '../../ListDetailsComponents/ListDetails.css';

const ItemsGrid = ({
  items,
  itemType,
  theme,
  onRemoveItem,
  emptyIcon,
  emptyMessage,
  emptySuggestion
}) => {
  // Depuración para ver los datos exactos que estamos recibiendo
  console.log(`Items en ItemsGrid (${itemType}):`, items);
  
  // Verificamos que items sea un array y tenga elementos
  const safeItems = Array.isArray(items) ? items : [];
  
  if (!safeItems.length) {
    return (
      <EmptyListMessage
        icon={emptyIcon}
        message={emptyMessage}
        suggestion={emptySuggestion}
      />
    );
  }

  const renderItem = (item, index) => {
    // Si el item es undefined o null, no lo renderizamos
    if (!item) {
      console.log(`Item ${index} es undefined o null`);
      return null;
    }

    // Verificar que el item tiene todos los campos necesarios
    const verifiedItem = {
      ...item,
      // Asegurar que imageUrl está presente
      imageUrl: item.imageUrl || null
    };

    const key = item.id || index; // Usa el índice como fallback si no hay ID
    
    switch (itemType) {
      case 'movie':
        return (
          <MovieItem
            key={key}
            movie={verifiedItem}
            theme={theme}
            onRemove={onRemoveItem}
          />
        );
      case 'actor':
        return (
          <ActorItem
            key={key}
            actor={verifiedItem}
            theme={theme}
            onRemove={onRemoveItem}
          />
        );
      case 'director':
        return (
          <DirectorItem
            key={key}
            director={verifiedItem}
            theme={theme}
            onRemove={onRemoveItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="items-grid">
      {safeItems.map((item, index) => renderItem(item, index))}
    </div>
  );
};

export default ItemsGrid;