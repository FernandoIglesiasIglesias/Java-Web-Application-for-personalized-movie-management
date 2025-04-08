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
  
  // Parámetro obligatorio: país (utilizamos España)
  url.searchParams.append('country', 'us');
  
  // Paginación con cursor
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }
  
  // Add filters if provided
  if (filters) {
    // Show type (movie is default)
    if (filters.showType) {
      url.searchParams.append('show_type', filters.showType);
    }
    
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
    
    // Rating range - Según la documentación debe ser un número entre 0-100
    if (filters.ratingMin !== undefined && filters.ratingMin !== "") {
      url.searchParams.append('rating_min', filters.ratingMin);
    }
    
    if (filters.ratingMax !== undefined && filters.ratingMax !== "") {
      url.searchParams.append('rating_max', filters.ratingMax);
    }
    
    // Géneros - La API espera los ID de género como strings
    if (filters.genres && filters.genres.length > 0) {
      // Mapeo correcto según la documentación de la API
      const genreMap = {
        '1': 'action',       // Acción
        '2': 'adventure',    // Aventura
        '3': 'animation',    // Animación
        '4': 'comedy',       // Comedia
        '5': 'crime',        // Crimen
        '6': 'documentary',  // Documental
        '7': 'drama',        // Drama
        '8': 'family',       // Familiar
        '9': 'fantasy',      // Fantasía
        '10': 'history',     // Historia
        '11': 'horror',      // Terror
        '12': 'music',       // Música
        '13': 'mystery',     // Misterio
        '14': 'romance',     // Romance
        '15': 'scifi',       // Ciencia Ficción
        '16': 'thriller',    // Thriller
        '17': 'war',         // Bélica
        '18': 'western'      // Western
      };
      
      // Mapear IDs a nombres de género y filtrar los no reconocidos
      const genreNames = filters.genres
        .map(id => genreMap[id])
        .filter(name => name !== undefined);
      
      if (genreNames.length > 0) {
        const genresStr = genreNames.join(',');
        url.searchParams.append('genres', genresStr);
        
        // Si hay más de un género, especificar la relación entre ellos
        if (genreNames.length > 1) {
          url.searchParams.append('genres_relation', filters.genresRelation || 'or');
        }
        
        // Logging para debug
        console.log("Géneros enviados:", genresStr);
      }
    }
    
    // Idioma original
    if (filters.showOriginalLanguage) {
      url.searchParams.append('show_original_language', filters.showOriginalLanguage);
    }
    
    // Ordenación - Mapear correctamente a los valores de la API
    if (filters.orderBy) {
      let apiOrderBy;
      
      // Mapeo correcto según la documentación
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
      // Por defecto ordenar por popularidad
      url.searchParams.append('order_by', 'popularity_1month');
    }
    
    // Dirección de ordenación
    if (filters.orderDirection) {
      url.searchParams.append('order_direction', filters.orderDirection);
    } else {
      url.searchParams.append('order_direction', 'desc');
    }
  } else {
    // Default values when no filters provided
    url.searchParams.append('show_type', 'movie');
    url.searchParams.append('order_by', 'popularity_1month');
    url.searchParams.append('order_direction', 'desc');
  }
  
  // Always set output language to Spanish
  url.searchParams.append('output_language', 'es');
  
  // Series granularity - Obtener información detallada de episodios
  url.searchParams.append('series_granularity', 'episode');

  // Log de la URL completa para debugging
  console.log("URL de petición:", url.toString());

  fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
      'x-rapidapi-key': 'cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8'
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        console.error("Error en la respuesta de la API:", text);
        console.error("URL que causó el error:", url.toString());
        throw new Error(`API error: ${response.status} - ${text}`);
      });
    }
    return response.json();
  })
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

export const searchMoviesByTitle = (title, onSuccess, onErrors) => {
  if (!title || title.trim() === '') {
    onErrors(new Error('El título de búsqueda no puede estar vacío'));
    return;
  }

  // Normalizar el título: quitar acentos, pasar a minúsculas
  const normalizedTitle = title.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const url = new URL('https://streaming-availability.p.rapidapi.com/shows/search/title');
  
  // Parámetros obligatorios
  url.searchParams.append('country', 'us');
  url.searchParams.append('title', normalizedTitle);
  
  // Parámetros opcionales pero con valores específicos
  url.searchParams.append('show_type', 'movie');  // Solo películas
  url.searchParams.append('output_language', 'es');  // Resultados en español
  url.searchParams.append('series_granularity', 'show');  // No incluir detalles de temporadas/episodios

  console.log("URL de búsqueda por título:", url.toString());

  fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
      'x-rapidapi-key': 'cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8'
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        console.error("Error en la respuesta de la API de búsqueda:", text);
        console.error("URL que causó el error:", url.toString());
        throw new Error(`API error: ${response.status} - ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log("Respuesta de búsqueda por título:", data);
    
    // Procesar los datos para asegurarnos de que todas las películas tengan la estructura correcta
    const processResults = (movies) => {
      if (!movies || movies.length === 0) {
        return [];
      }
      
      return movies.map(movie => {
        // Procesar la estructura de imageSet si es necesario
        let processedMovie = { ...movie };
        
        // Si no tiene imageSet pero tiene posterURLs, convertirlos al formato esperado
        if (!processedMovie.imageSet && processedMovie.posterURLs) {
          processedMovie.imageSet = {
            verticalPoster: {
              w240: processedMovie.posterURLs?.w342 || processedMovie.posterURLs?.w500,
              w500: processedMovie.posterURLs?.w500 || processedMovie.posterURLs?.w780,
              w720: processedMovie.posterURLs?.w780 || processedMovie.posterURLs?.original
            }
          };
        }
        
        // Asegurar que haya una URL de poster para mostrar
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
    
    // Verificar el formato de la respuesta
    // Si la respuesta es un array en lugar de un objeto con propiedad 'result'
    if (Array.isArray(data)) {
      return {
        shows: processResults(data),
        hasMore: false,
        nextCursor: null,
        isSimplifiedSearch: false
      };
    }
    
    // Si no hay resultados pero tenemos un título con espacios, intentar con un título simplificado
    if ((!data.result || data.result.length === 0) && title.includes(" ")) {
      console.log("No se encontraron resultados con el título completo, intentando con palabras clave...");
      
      // Crear una nueva URL con solo la primera palabra del título (generalmente más efectivo)
      const simpleTitle = title.split(" ")[0];
      const newUrl = new URL('https://streaming-availability.p.rapidapi.com/shows/search/title');
      newUrl.searchParams.append('country', 'us');
      newUrl.searchParams.append('title', simpleTitle);
      newUrl.searchParams.append('show_type', 'movie');
      newUrl.searchParams.append('output_language', 'es');
      newUrl.searchParams.append('series_granularity', 'show');
      
      console.log("Intentando búsqueda con título simplificado:", newUrl.toString());
      
      // Realizar una segunda búsqueda con el título simplificado
      return fetch(newUrl.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
          'x-rapidapi-key': 'cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        return response.json();
      })
      .then(secondData => {
        console.log("Respuesta de búsqueda con título simplificado:", secondData);
        
        // Verificar si la respuesta es un array
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
    
    // Procesamos los resultados para mantener consistencia con el formato
    // que espera el resto de la aplicación
    return {
      shows: processResults(data.result || []),
      hasMore: false, // La API de búsqueda por título no soporta paginación
      nextCursor: null,
      isSimplifiedSearch: false
    };
  })
  .then(processedResults => {
    // Si no se encontraron resultados incluso con la búsqueda simplificada,
    // intentar con la API de filtros como último recurso
    if (processedResults.shows.length === 0 && !processedResults.isSimplifiedSearch) {
      console.log("No se encontraron resultados. Intentando con búsqueda por filtro keyword...");
      
      // Usar la función getExternalMovies pero con el título como keyword
      getExternalMovies(
        null, // sin cursor
        { 
          showType: 'movie',
          keyword: title.trim()
        },
        data => {
          console.log("Resultados de búsqueda por keyword:", data);
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