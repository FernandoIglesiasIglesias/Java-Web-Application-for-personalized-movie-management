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
  // Crear una copia profunda para evitar problemas de referencia
  const movieToSave = JSON.parse(JSON.stringify({
    ...movie,
    cast: (movie.cast || []).map(actor => ({
      ...actor,
      // Asegurar que imdbId se preserva
      imdbId: actor.imdbId || null
    })),
    directors: (movie.directors || []).map(director => ({
      ...director,
      // Asegurar que imdbId se preserva
      imdbId: director.imdbId || null
    }))
  }));
    
  appFetch(
    "/movies/saveMovie",
    fetchConfig("POST", movieToSave),
    (savedMovie) => {
      onSuccess(savedMovie);
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
  
  if (filters) {
    if (filters.showType) {
      url.searchParams.append('show_type', filters.showType);
    }
    
    if (filters.keyword) {
      url.searchParams.append('keyword', filters.keyword);
    }
    
    if (filters.yearMin) {
      url.searchParams.append('year_min', filters.yearMin);
    }
    
    if (filters.yearMax) {
      url.searchParams.append('year_max', filters.yearMax);
    }
    
    if (filters.ratingMin !== undefined && filters.ratingMin !== "") {
      url.searchParams.append('rating_min', filters.ratingMin);
    }
    
    if (filters.ratingMax !== undefined && filters.ratingMax !== "") {
      url.searchParams.append('rating_max', filters.ratingMax);
    }
    
    if (filters.genres && filters.genres.length > 0) {
      const genreMap = {
        '1': 'action',       
        '2': 'adventure',    
        '3': 'animation',    
        '4': 'comedy',       
        '5': 'crime',        
        '6': 'documentary',  
        '7': 'drama',        
        '8': 'family',       
        '9': 'fantasy',      
        '10': 'history',     
        '11': 'horror',      
        '12': 'music',       
        '13': 'mystery',     
        '14': 'romance',     
        '15': 'scifi',       
        '16': 'thriller',    
        '17': 'war',         
        '18': 'western'      
      };
      
      const genreNames = filters.genres
        .map(id => genreMap[id])
        .filter(name => name !== undefined);
      
      if (genreNames.length > 0) {
        const genresStr = genreNames.join(',');
        url.searchParams.append('genres', genresStr);
        
        if (genreNames.length > 1) {
          url.searchParams.append('genres_relation', filters.genresRelation || 'or');
        }
      }
    }
    
    if (filters.showOriginalLanguage) {
      url.searchParams.append('show_original_language', filters.showOriginalLanguage);
    }
    
    if (filters.orderBy) {
      let apiOrderBy;
      
      switch (filters.orderBy) {
        case 'original_title':
          apiOrderBy = 'original_title';
          break;
        case 'year':
          apiOrderBy = 'release_date';
          break;
        case 'rating':
          apiOrderBy = 'rating';
          break;
        case 'popularity_1month':
          apiOrderBy = 'popularity_1month';
          break;
        case 'popularity_1week':
          apiOrderBy = 'popularity_1week';
          break;
        default:
          apiOrderBy = 'popularity_1month';
      }
      
      url.searchParams.append('order_by', apiOrderBy);
    } else {
      url.searchParams.append('order_by', 'popularity_1month');
    }
    
    if (filters.orderDirection) {
      url.searchParams.append('order_direction', filters.orderDirection);
    } else {
      url.searchParams.append('order_direction', 'desc');
    }
  } else {
    url.searchParams.append('show_type', 'movie');
    url.searchParams.append('order_by', 'popularity_1month');
    url.searchParams.append('order_direction', 'desc');
  }
  
  url.searchParams.append('output_language', 'es');
  url.searchParams.append('series_granularity', 'episode');

  fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
      'x-rapidapi-key': 'cdbfa3dd29mshcd4df13fafdf647p1c3170jsn3d0e626a103b'
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`API error: ${response.status} - ${text}`);
      });
    }
    return response.json();
  })
  .then(onSuccess)
  .catch(onErrors);
};

// Almacenar en caché los resultados del reparto para evitar llamadas repetidas
const castCache = new Map();

export const getMovieCast = (imdbId, onSuccess, onErrors) => {
  // Si ya tenemos el reparto en caché, usar eso en lugar de hacer otra llamada
  if (castCache.has(imdbId)) {
    setTimeout(() => onSuccess(castCache.get(imdbId)), 0);
    return;
  }
  
  fetch(`https://imdb236.p.rapidapi.com/api/imdb/${imdbId}/cast`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'imdb236.p.rapidapi.com',
      'x-rapidapi-key': 'cdbfa3dd29mshcd4df13fafdf647p1c3170jsn3d0e626a103b'
    }
  })
  .then(response => {
    if (!response.ok) {
      if (response.status === 403) {
        // Probablemente límite de API excedido, devolver un arreglo vacío
        return [];
      }
      throw new Error(`API responded with status ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Guardar en caché para futuras solicitudes
    castCache.set(imdbId, data);
    onSuccess(data);
  })
  .catch(error => {
    // Si hay un error, devolver un arreglo vacío para evitar fallos en la UI
    onErrors(error);
  });
};
export const searchMoviesByTitle = (title, onSuccess, onErrors) => {
  if (!title || title.trim() === '') {
    onErrors(new Error('El título de búsqueda no puede estar vacío'));
    return;
  }

  const normalizedTitle = title.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const url = new URL('https://streaming-availability.p.rapidapi.com/shows/search/title');
  
  url.searchParams.append('country', 'us');
  url.searchParams.append('title', normalizedTitle);
  url.searchParams.append('show_type', 'movie');
  url.searchParams.append('output_language', 'es');
  url.searchParams.append('series_granularity', 'show');

  fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
      'x-rapidapi-key': 'cdbfa3dd29mshcd4df13fafdf647p1c3170jsn3d0e626a103b'
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`API error: ${response.status} - ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    const processResults = (movies) => {
      if (!movies || movies.length === 0) {
        return [];
      }
      
      return movies.map(movie => {
        let processedMovie = { ...movie };
        
        if (!processedMovie.imageSet && processedMovie.posterURLs) {
          processedMovie.imageSet = {
            verticalPoster: {
              w240: processedMovie.posterURLs?.w342 || processedMovie.posterURLs?.w500,
              w500: processedMovie.posterURLs?.w500 || processedMovie.posterURLs?.w780,
              w720: processedMovie.posterURLs?.w780 || processedMovie.posterURLs?.original
            }
          };
        }
        
        if (processedMovie.verticalPoster && !processedMovie.imageSet) {
          processedMovie.imageSet = {
            verticalPoster: {
              w240: processedMovie.verticalPoster,
              w500: processedMovie.verticalPoster,
              w720: processedMovie.verticalPoster
            }
          };
        }
        
        return processedMovie;
      });
    };
    
    if (Array.isArray(data)) {
      return {
        shows: processResults(data),
        hasMore: false,
        nextCursor: null,
        isSimplifiedSearch: false
      };
    }
    
    if ((!data.result || data.result.length === 0) && title.includes(" ")) {
      const simpleTitle = title.split(" ")[0];
      const newUrl = new URL('https://streaming-availability.p.rapidapi.com/shows/search/title');
      newUrl.searchParams.append('country', 'us');
      newUrl.searchParams.append('title', simpleTitle);
      newUrl.searchParams.append('show_type', 'movie');
      newUrl.searchParams.append('output_language', 'es');
      newUrl.searchParams.append('series_granularity', 'show');
      
      return fetch(newUrl.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
          'x-rapidapi-key': 'cdbfa3dd29mshcd4df13fafdf647p1c3170jsn3d0e626a103b'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        return response.json();
      })
      .then(secondData => {
        if (Array.isArray(secondData)) {
          return {
            shows: processResults(secondData),
            hasMore: false,
            nextCursor: null,
            isSimplifiedSearch: true
          };
        }
        
        return {
          shows: processResults(secondData.result || []),
          hasMore: false,
          nextCursor: null,
          isSimplifiedSearch: true
        };
      });
    }
    
    return {
      shows: processResults(data.result || []),
      hasMore: false,
      nextCursor: null,
      isSimplifiedSearch: false
    };
  })
  .then(processedResults => {
    if (processedResults.shows.length === 0 && !processedResults.isSimplifiedSearch) {
      getExternalMovies(
        null,
        { 
          showType: 'movie',
          keyword: title.trim()
        },
        data => {
          onSuccess(data);
        },
        onErrors
      );
    } else {
      onSuccess(processedResults);
    }
  })
  .catch(onErrors);
};