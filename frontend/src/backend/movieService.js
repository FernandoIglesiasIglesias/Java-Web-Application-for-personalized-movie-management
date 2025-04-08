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

export const getExternalMovies = (cursor, filters, onSuccess, onErrors) => {
  const url = new URL('https://streaming-availability.p.rapidapi.com/shows/search/filters');
  url.searchParams.append('country', 'us');
  
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }
  
  // Add filters if provided
  if (filters) {
    // Show type (movie is default)
    url.searchParams.append('show_type', filters.showType || 'movie');
    
    // Search keyword
    if (filters.keyword) {
      url.searchParams.append('keyword', filters.keyword);
    }
    
    // Year range
    if (filters.yearMin) {
      url.searchParams.append('year_min', filters.yearMin);
    }
    
    if (filters.yearMax) {
      url.searchParams.append('year_max', filters.yearMax);
    }
    
    // Rating range
    if (filters.ratingMin) {
      url.searchParams.append('rating_min', filters.ratingMin);
    }
    
    if (filters.ratingMax) {
      url.searchParams.append('rating_max', filters.ratingMax);
    }
    
    // Genres
    if (filters.genres && filters.genres.length > 0) {
      url.searchParams.append('genres', filters.genres.join(','));
    }
    
    // Original language
    if (filters.showOriginalLanguage) {
      url.searchParams.append('show_original_language', filters.showOriginalLanguage);
    }
    
    // Order by and direction
    if (filters.orderBy) {
      url.searchParams.append('order_by', filters.orderBy);
    }
    
    if (filters.orderDirection) {
      url.searchParams.append('order_direction', filters.orderDirection);
    }
  } else {
    // Default values when no filters provided
    url.searchParams.append('order_direction', 'desc');
    url.searchParams.append('order_by', 'popularity_1month');
    url.searchParams.append('show_type', 'movie');
  }
  
  // Always set output language to Spanish
  url.searchParams.append('output_language', 'es');

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