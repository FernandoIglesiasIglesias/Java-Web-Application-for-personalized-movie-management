import { fetchConfig, appFetch } from "./appFetch";

export const getAllMovies = (onSuccess, onErrors) => {
  appFetch(
    "/movies/allMovies",
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

/*
export const getMovieDetails = (id, onSuccess, onErrors) => {
  appFetch(
    `/movies/${id}`,
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};
*/

export const getExternalMovies = (cursor, onSuccess, onErrors) => {
  const url = new URL('https://streaming-availability.p.rapidapi.com/shows/search/filters');
  url.searchParams.append('country', 'us');
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }
  url.searchParams.append('order_direction', 'desc');
  url.searchParams.append('order_by', 'popularity_1month');
  url.searchParams.append('output_language', 'es');
  url.searchParams.append('show_type', 'movie');

  fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
      'x-rapidapi-key': 'cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8'
    }
  })
  .then(response => response.json())
  .then(onSuccess)
  .catch(onErrors);
};