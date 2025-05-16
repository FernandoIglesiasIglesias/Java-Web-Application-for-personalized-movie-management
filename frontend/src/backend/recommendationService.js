import { appFetch, fetchConfig } from "./appFetch";

export const getRecommendations = (limit = 10, onSuccess, onErrors) => {
  appFetch(
    `/recommendations?limit=${limit}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const recordMovieView = (movieId, onSuccess, onErrors) => {
  appFetch(
    `/recommendations/view/${movieId}`,
    fetchConfig("POST"),
    onSuccess,
    onErrors
  );
};

export const recordMovieRating = (movieId, rating, onSuccess, onErrors) => {
  appFetch(
    `/recommendations/rate/${movieId}`,
    fetchConfig("POST", { rating }),
    onSuccess,
    onErrors
  );
};

export const recordSearch = (searchParams, onSuccess, onErrors) => {
  appFetch(
    `/recommendations/search`,
    fetchConfig("POST", { searchParams }),
    onSuccess,
    onErrors
  );
};