import { fetchConfig, appFetch } from "./appFetch";

/**
 * Gets all actors from the database.
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
 * Gets an actor by name.
 */
export const getActorByName = (name, onSuccess, onErrors) => {
  appFetch(
    `/actors/name/${encodeURIComponent(name)}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const createActor = (actorData, onSuccess, onErrors) => {
  const { character, ...actorDataWithoutCharacter } = actorData;

  appFetch(
    "/actors/create",
    fetchConfig("POST", actorDataWithoutCharacter),
    onSuccess,
    onErrors
  );
};

export const updateActorByName = (name, actorData, onSuccess, onErrors) => {
  appFetch(
    `/actors/name/${encodeURIComponent(name)}`,
    fetchConfig("PUT", actorData),
    onSuccess,
    onErrors
  );
};