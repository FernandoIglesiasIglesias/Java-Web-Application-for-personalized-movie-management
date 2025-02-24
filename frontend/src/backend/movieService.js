import { fetchConfig, appFetch } from "./appFetch";

export const getAllMovies = (onSuccess, onErrors) => {
  appFetch(
    "/movies/allMovies",
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const getMovieDetails = (id, onSuccess, onErrors) => {
  appFetch(
    `/movies/${id}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};