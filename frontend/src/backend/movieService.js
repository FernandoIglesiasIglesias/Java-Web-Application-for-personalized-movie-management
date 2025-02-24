import { fetchConfig, appFetch } from "./appFetch";

export const getAllMovies = (onSuccess, onErrors) => {
  appFetch(
    "/movies/allMovies",
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};