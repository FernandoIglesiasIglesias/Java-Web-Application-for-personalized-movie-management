import { fetchConfig, appFetch } from "./appFetch";

export const getAllMovies = (onSuccess, onErrors) => {
  appFetch(
    "/movies/allMovies",
    fetchConfig("GET"),
    onSuccess,
    onErrors
  );
};

export const saveMovie = (movie, onSuccess, onErrors) => {
  console.log("Enviando película al backend:", JSON.stringify(movie));
  
  // Asegurarnos de que cada actor y director tiene un imdbId explícito
  const movieToSave = {
    ...movie,
    cast: movie.cast.map(actor => ({
      ...actor,
      imdbId: actor.imdbId || null // Asegurarnos de que no se envía undefined
    })),
    directors: movie.directors.map(director => ({
      ...director,
      imdbId: director.imdbId || null // Asegurarnos de que no se envía undefined
    }))
  };
  
  appFetch(
    "/movies/saveMovie",
    fetchConfig("POST", movieToSave),
    (result) => {
      console.log("Respuesta del backend al guardar película:", result);
      onSuccess(result);
    },
    onErrors
  );
};

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

export const getMovieCast = (imdbId, onSuccess, onErrors) => {
  fetch(`https://imdb236.p.rapidapi.com/imdb/${imdbId}/cast`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'imdb236.p.rapidapi.com',
      'x-rapidapi-key': 'cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    return response.json();
  })
  .then(onSuccess)
  .catch(onErrors);
};