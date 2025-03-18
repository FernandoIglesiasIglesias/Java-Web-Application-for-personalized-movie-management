import { fetchConfig, appFetch } from "./appFetch";

/**
 * Gets all actors from the database.
 * 
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getAllActors = (onSuccess, onErrors) => {
  appFetch(
    "/actors/all",
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

/**
 * Gets an actor by ID.
 * 
 * @param {number} id - The actor's ID
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getActorById = (id, onSuccess, onErrors) => {
  appFetch(
    `/actors/${id}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

/**
 * Gets an actor by IMDB ID.
 * 
 * @param {string} imdbId - The actor's IMDB ID
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getActorByImdbId = (imdbId, onSuccess, onErrors) => {
  appFetch(
    `/actors/imdb/${imdbId}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

/**
 * Gets an actor by first name and last name.
 * 
 * @param {string} firstName - The actor's first name
 * @param {string} lastName - The actor's last name
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const getActorByName = (firstName, lastName, onSuccess, onErrors) => {
  appFetch(
    `/actors/name?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

/**
 * Updates an actor by name.
 * 
 * @param {string} firstName - The actor's first name
 * @param {string} lastName - The actor's last name
 * @param {object} actorData - The actor data to update
 * @param {function} onSuccess - Callback for successful response
 * @param {function} onErrors - Callback for error response
 */
export const updateActorByName = (firstName, lastName, actorData, onSuccess, onErrors) => {
  appFetch(
    `/actors/name/${encodeURIComponent(firstName)}/${encodeURIComponent(lastName)}`,
    fetchConfig("PUT", actorData),
    onSuccess,
    onErrors
  );
};
