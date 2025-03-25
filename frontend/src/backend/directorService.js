import { config, appFetch } from './appFetch';

/**
 * Get all directors
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getAllDirectors = (onSuccess, onErrors) => {
    appFetch('/directors/all', config('GET'), onSuccess, onErrors);
};

/**
 * Get director by ID
 * @param {number} id - Director ID
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getDirectorById = (id, onSuccess, onErrors) => {
    appFetch(`/directors/${id}`, config('GET'), onSuccess, onErrors);
};

/**
 * Get director by IMDB ID
 * @param {string} imdbId - Director's IMDB ID
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getDirectorByImdbId = (imdbId, onSuccess, onErrors) => {
    appFetch(`/directors/imdb/${imdbId}`, config('GET'), onSuccess, onErrors);
};

/**
 * Get director by first name and last name
 * @param {string} firstName - Director's first name
 * @param {string} lastName - Director's last name
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getDirectorByName = (firstName, lastName, onSuccess, onErrors) => {
    const encodedFirstName = encodeURIComponent(firstName);
    const encodedLastName = encodeURIComponent(lastName);
    appFetch(`/directors/name?firstName=${encodedFirstName}&lastName=${encodedLastName}`, 
        config('GET'), onSuccess, onErrors);
};

/**
 * Update a director by name
 * @param {string} firstName - Director's first name
 * @param {string} lastName - Director's last name
 * @param {object} directorData - Updated director data
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const updateDirectorByName = (firstName, lastName, directorData, onSuccess, onErrors) => {
    const encodedFirstName = encodeURIComponent(firstName);
    const encodedLastName = encodeURIComponent(lastName);
    appFetch(`/directors/name/${encodedFirstName}/${encodedLastName}`, 
        config('PUT', directorData), onSuccess, onErrors);
};