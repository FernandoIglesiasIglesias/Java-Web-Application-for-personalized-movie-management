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
    (data) => {
      // Solo llamar a onSuccess si hay datos válidos
      if (data !== null && data !== undefined) {
        onSuccess(data);
      } else {
        // Si no hay datos, llamar a onErrors con un mensaje descriptivo
        onErrors({ message: "No hay valoraciones disponibles para esta película" });
      }
    },
    (error) => {
      // Si el error es un 404, significa que no hay valoraciones
      if (error && error.status === 404) {
        onErrors({ message: "No hay valoraciones para esta película" });
      } else {
        onErrors(error);
      }
    });
};

export const deleteRating = (userId, imdbId, onSuccess, onErrors) => {
  appFetch(`/ratings/${userId}/${imdbId}`,
    fetchConfig('DELETE'),
    onSuccess,
    onErrors);
};
