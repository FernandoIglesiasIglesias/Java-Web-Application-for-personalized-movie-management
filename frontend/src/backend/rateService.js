import {fetchConfig, appFetch} from './appFetch';

export const rateMovie = (userId, imdbId, value, onSuccess, onErrors) => {
  appFetch(`/ratings/${userId}/${imdbId}?value=${value}`, 
    fetchConfig('POST'), 
    onSuccess, 
    onErrors);
};

export const getUserRatingForMovie = (userId, imdbId, onSuccess, onErrors) => {
  appFetch(`/ratings/${userId}/${imdbId}`,
    fetchConfig('GET'),
    onSuccess,
    onErrors);
};

export const getAverageRatingForMovie = (imdbId, onSuccess, onErrors) => {
  appFetch(`/ratings/movie/${imdbId}/average`,
    fetchConfig('GET'),
    onSuccess,
    onErrors);
};

export const deleteRating = (userId, imdbId, onSuccess, onErrors) => {
  appFetch(`/ratings/${userId}/${imdbId}`,
    fetchConfig('DELETE'),
    onSuccess,
    onErrors);
};
