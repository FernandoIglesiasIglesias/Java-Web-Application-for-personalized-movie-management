import { fetchConfig, appFetch } from './appFetch';

export const getUserActorLists = (userId, onSuccess, onErrors) => {
  appFetch(
    `/actor-lists/user/${userId}`,
    fetchConfig('GET'),
    onSuccess,
    onErrors
  );
};

export const getActorListById = (listId, onSuccess, onErrors) => {
  appFetch(
    `/actor-lists/${listId}`,
    fetchConfig('GET'),
    onSuccess,
    onErrors
  );
};

export const createActorList = (userId, name, onSuccess, onErrors) => {
  const actorList = {
    userId: userId,
    name: name
  };
  
  appFetch(
    '/actor-lists',
    fetchConfig('POST', actorList),
    onSuccess,
    onErrors
  );
};

export const updateActorList = (listId, name, onSuccess, onErrors) => {
  const actorList = {
    name: name
  };
  
  appFetch(
    `/actor-lists/${listId}`,
    fetchConfig('PUT', actorList),
    onSuccess,
    onErrors
  );
};

export const deleteActorList = (listId, onSuccess, onErrors) => {
  appFetch(
    `/actor-lists/${listId}`,
    fetchConfig('DELETE'),
    onSuccess,
    onErrors
  );
};

export const addActorToList = (listId, actorId, onSuccess, onErrors) => {
  appFetch(
    `/actor-lists/${listId}/actors/${actorId}`,
    fetchConfig('POST'),
    onSuccess,
    onErrors
  );
};

export const removeActorFromList = (listId, actorId, onSuccess, onErrors) => {
  appFetch(
    `/actor-lists/${listId}/actors/${actorId}`,
    fetchConfig('DELETE'),
    onSuccess,
    onErrors
  );
};