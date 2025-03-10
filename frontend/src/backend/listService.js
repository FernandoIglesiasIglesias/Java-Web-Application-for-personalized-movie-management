import { fetchConfig, appFetch } from "./appFetch";

// Obtener todas las listas del usuario
export const getUserLists = (onSuccess, onErrors) => {
  appFetch(
    "/lists",
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

// Obtener una lista específica por ID
export const getListById = (listId, onSuccess, onErrors) => {
  appFetch(
    `/lists/${listId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

// Crear una nueva lista
export const createList = (listName, onSuccess, onErrors) => {
  appFetch(
    "/lists",
    fetchConfig("POST", { name: listName }),
    onSuccess,
    onErrors
  );
};

// Actualizar el nombre de una lista
export const updateList = (listId, newName, onSuccess, onErrors) => {
  appFetch(
    `/lists/${listId}`,
    fetchConfig("PUT", { name: newName }),
    onSuccess,
    onErrors
  );
};

// Eliminar una lista
export const deleteList = (listId, onSuccess, onErrors) => {
  appFetch(
    `/lists/${listId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
  );
};

// Añadir una película a una lista
export const addMovieToList = (listId, movie, onSuccess, onErrors) => {
  appFetch(
    `/lists/${listId}/movies`,
    fetchConfig("POST", movie),
    onSuccess,
    onErrors
  );
};

// Eliminar una película de una lista
export const removeMovieFromList = (listId, movieId, onSuccess, onErrors) => {
  appFetch(
    `/lists/${listId}/movies/${movieId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
  );
};