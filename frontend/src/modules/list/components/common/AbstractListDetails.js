import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import { Errors } from '../../../common';
import ListHeader from "../ListDetailsComponents/ListHeader";
import ConfirmDialog from '../ListDetailsComponents/ConfirmDialog';
import ListBottomActions from '../ListDetailsComponents/ListBottomActions';
import LoadingIndicator from '../ListDetailsComponents/LoadingIndicator';
import '../ListDetailsComponents/ListDetails.css';

const AbstractListDetails = ({
  getList,
  updateList,
  deleteList,
  removeItemFromList,
  renderItems,
  itemsName,
  itemsIcon,
  noItemsMessage,
  noItemsSuggestion,
  exploreLink,
  exploreLinkText,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [list, setList] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [listName, setListName] = useState('');
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Función para cargar los detalles de la lista
  const loadListDetails = useCallback(() => {
    setLoading(true);
    getList(
      id,
      (fetchedList) => {
        setList(fetchedList);
        setListName(fetchedList.name);
        setLoading(false);
      },
      (error) => {
        setErrors(error);
        setLoading(false);
      }
    );
  }, [id, getList]);

  // Cargar los detalles de la lista al montar el componente o cambiar el ID
  useEffect(() => {
    if (id) {
      loadListDetails();
    }
  }, [id, loadListDetails]);

  // Manejar actualización del nombre de la lista
  const handleUpdateList = () => {
    if (listName.trim() && listName !== list.name) {
      setLoading(true);
      updateList(
        id,
        listName.trim(),
        (updatedList) => {
          setList(updatedList);
          setEditMode(false);
          setErrors(null);
          setLoading(false);
        },
        (error) => {
          setErrors(error);
          setLoading(false);
        }
      );
    } else {
      setEditMode(false);
    }
  };

  // Manejar eliminación de la lista
  const handleDeleteList = () => {
    setLoading(true);
    deleteList(
      id,
      () => {
        navigate('/user/lists', { state: { message: 'Lista eliminada correctamente' } });
      },
      (error) => {
        setErrors(error);
        setIsConfirmDeleteOpen(false);
        setLoading(false);
      }
    );
  };

  const handleRemoveItem = (itemId, event) => {
    if (event) {
      event.stopPropagation(); // Evitar que el clic se propague a la tarjeta
      
      const itemCard = event.target.closest('.item-card');
      
      if (itemCard) {
        itemCard.classList.add('removing');
        
        setTimeout(() => {
          removeItemFromList(
            id,
            itemId,
            (updatedList) => {
              setList(updatedList);
            },
            (error) => {
              setErrors(error);
            }
          );
        }, 500);
        return; // Salir de la función después de iniciar la animación
      }
    }
    
    // Si no hay evento o no se encontró itemCard, eliminar directamente sin animación
    removeItemFromList(
      id,
      itemId,
      (updatedList) => {
        setList(updatedList);
      },
      (error) => {
        setErrors(error);
      }
    );
  };

  // Si está cargando, mostrar mensaje de carga
  if (loading) {
    return (
      <div className={`list-details-page theme-${theme}`}>
        <div className={`list-details-container ${theme}`}>
          <LoadingIndicator message={`Cargando detalles de la lista...`} theme={theme} />
        </div>
      </div>
    );
  }

  // Obtener el recuento de elementos
  const getItemsCount = () => {
    if (!list || !list[itemsName] || !Array.isArray(list[itemsName])) {
      return 0;
    }
    return list[itemsName].length;
  };

  // Manejar vaciado de la lista
  const handleClearList = () => {
    const itemsCount = getItemsCount();
    
    if (itemsCount > 0) {
      setLoading(true);
      
      // Esta implementación asume que tienes servicios que limpian la lista completa
      // Si no existe tal servicio, se deberá implementar la lógica para eliminar items uno por uno aquí
      Promise.all(list[itemsName].map(item => 
        new Promise((resolve, reject) => {
          removeItemFromList(
            id,
            item.id,
            () => resolve(),
            (error) => reject(error)
          );
        })
      ))
      .then(() => {
        loadListDetails();
        setIsConfirmClearOpen(false);
      })
      .catch((error) => {
        setErrors(error);
        setIsConfirmClearOpen(false);
        setLoading(false);
      });
    }
  };

  return (
    <div className={`list-details-page theme-${theme}`}>
      <div className={`list-details-container ${theme}`}>
        {errors && <Errors errors={errors} onClose={() => setErrors(null)} />}
        
        <ListHeader 
          list={list}
          editMode={editMode}
          listName={listName}
          setListName={setListName}
          theme={theme}
          onUpdateList={handleUpdateList}
          setEditMode={setEditMode}
          onShowDeleteConfirm={() => setIsConfirmDeleteOpen(true)}
        />
        
        <ConfirmDialog 
          isOpen={isConfirmDeleteOpen}
          title="¿Eliminar lista?"
          message={`¿Estás seguro de que quieres eliminar la lista "${list?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={handleDeleteList}
          onCancel={() => setIsConfirmDeleteOpen(false)}
          theme={theme}
        />
        
        <ConfirmDialog 
          isOpen={isConfirmClearOpen}
          title={`¿Vaciar lista?`}
          message={`¿Estás seguro de que quieres eliminar todos los elementos de la lista "${list?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Vaciar"
          onConfirm={handleClearList}
          onCancel={() => setIsConfirmClearOpen(false)}
          theme={theme}
        />
        
        <div className="list-content-container">
          <h2>
            {itemsName.charAt(0).toUpperCase() + itemsName.slice(1)} en esta lista
            {getItemsCount() > 0 && (
              <span className="item-count">
                {getItemsCount()} {getItemsCount() === 1 ? itemsName.slice(0, -1) : itemsName}
              </span>
            )}
          </h2>
          
          {renderItems(list, theme, handleRemoveItem, itemsIcon, noItemsMessage, noItemsSuggestion)}
        </div>
        
        <ListBottomActions 
          theme={theme}
          itemsCount={getItemsCount()}
          onClearList={() => {
            if (getItemsCount() > 0) {
              setIsConfirmClearOpen(true);
            } else {
              setErrors({
                globalError: "La lista ya está vacía."
              });
            }
          }}
          onGoBack={() => navigate('/user/lists')}
          onExploreMore={() => navigate(exploreLink)}
          exploreLinkPath={exploreLink}
          exploreLinkText={exploreLinkText}
          showExploreButton={!!exploreLink}
        />
      </div>
    </div>
  );
};

export default AbstractListDetails;