import { fetchConfig, appFetch } from './appFetch';

/**
 * Get all directors
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getAllDirectors = (onSuccess, onErrors) => {
    appFetch('/directors/all', fetchConfig('GET'), onSuccess, onErrors);
};

/**
 * Get director by ID
 * @param {number} id - Director ID
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getDirectorById = (id, onSuccess, onErrors) => {
    appFetch(`/directors/${id}`, fetchConfig('GET'), onSuccess, onErrors);
};

/**
 * Get director by IMDB ID
 * @param {string} imdbId - Director's IMDB ID
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getDirectorByImdbId = (imdbId, onSuccess, onErrors) => {
    appFetch(`/directors/imdb/${imdbId}`, fetchConfig('GET'), onSuccess, onErrors);
};

export const getDirectorByName = (name, onSuccess, onErrors) => {
  appFetch(
    `/directors/name/${encodeURIComponent(name)}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const createDirector = (directorData, onSuccess, onErrors) => {
  appFetch(
    "/directors/create",
    fetchConfig("POST", directorData),
    onSuccess,
    onErrors
  );
};

export const updateDirectorByName = (name, directorData, onSuccess, onErrors) => {
  appFetch(
    `/directors/name/${encodeURIComponent(name)}`,
    fetchConfig("PUT", directorData),
    onSuccess,
    onErrors
  );
};