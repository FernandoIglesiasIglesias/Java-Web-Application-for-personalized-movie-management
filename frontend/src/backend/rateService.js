import {appFetch, fetchConfig} from './appFetch';

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

export const getUserRatings = (userId, onSuccess, onErrors) => {
  appFetch(`/ratings/user/${userId}`,
    fetchConfig('GET'),
    onSuccess,
    onErrors);
};

export const getMovieRatings = (imdbId, onSuccess, onErrors) => {
  appFetch(`/ratings/movie/${imdbId}`,
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

export const getTopRatedMovies = (genre, year, pageSize, page, onSuccess, onErrors) => {
  let url = `/ratings/topRated?pageSize=${pageSize}&page=${page}`;
  
  if (genre) url += `&genre=${encodeURIComponent(genre)}`;
  if (year) url += `&year=${year}`;
  
  appFetch(url,
    fetchConfig('GET'),
    onSuccess,
    onErrors);
};