import { fetchConfig, appFetch } from './appFetch';

export const getUserDirectorLists = (userId, onSuccess, onErrors) => {
  appFetch(
    `/director-lists/user/${userId}`,
    fetchConfig('GET'),
    onSuccess,
    onErrors
  );
};

export const getDirectorListById = (listId, onSuccess, onErrors) => {
  appFetch(
    `/director-lists/${listId}`,
    fetchConfig('GET'),
    onSuccess,
    onErrors
  );
};

export const createDirectorList = (userId, name, onSuccess, onErrors) => {
  const directorList = {
    userId: userId,
    name: name
  };
  
  appFetch(
    '/director-lists',
    fetchConfig('POST', directorList),
    onSuccess,
    onErrors
  );
};

export const updateDirectorList = (listId, name, onSuccess, onErrors) => {
  const directorList = {
    name: name
  };
  
  appFetch(
    `/director-lists/${listId}`,
    fetchConfig('PUT', directorList),
    onSuccess,
    onErrors
  );
};

export const deleteDirectorList = (listId, onSuccess, onErrors) => {
  appFetch(
    `/director-lists/${listId}`,
    fetchConfig('DELETE'),
    onSuccess,
    onErrors
  );
};

export const addDirectorToList = (listId, directorId, onSuccess, onErrors) => {
  appFetch(
    `/director-lists/${listId}/directors/${directorId}`,
    fetchConfig('POST'),
    onSuccess,
    onErrors
  );
};

export const removeDirectorFromList = (listId, directorId, onSuccess, onErrors) => {
  appFetch(
    `/director-lists/${listId}/directors/${directorId}`,
    fetchConfig('DELETE'),
    onSuccess,
    onErrors
  );
};