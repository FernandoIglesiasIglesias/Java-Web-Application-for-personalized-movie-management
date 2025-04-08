import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import MovieHeader from "./explorer/MovieHeader";
import MovieFilters from "./explorer/MovieFilters";
import MovieResults from "./explorer/MovieResults";
import SearchBar from "./explorer/SearchBar";
import { getExternalMovies, searchMoviesByTitle } from "../../../backend/movieService";
import { getTopRatedMovies } from "../../../backend/rateService";
import "./MovieExplorer.css";

const MovieExplorer = ({ user }) => {
  const { theme } = useTheme();
  const [errors, setErrors] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Movie source state
  const [movieSource, setMovieSource] = useState("external"); // "external", "topRated", "search"
  
  // Search state
  const [searchTitle, setSearchTitle] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // External API movies state
  const [externalMovies, setExternalMovies] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingExternal, setLoadingExternal] = useState(true);
  const [loadingMoreExternal, setLoadingMoreExternal] = useState(false);
  
  // Top rated movies state
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loadingTopRated, setLoadingTopRated] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    keyword: "",
    showType: "movie",
    yearMin: "",
    yearMax: "",
    ratingMin: "",
    ratingMax: "",
    genres: [],
    orderBy: "popularity_1month",
    orderDirection: "desc",
    showOriginalLanguage: "",
    genresRelation: "or"
  });

  // Fetch external movies
  const fetchExternalMovies = (currentCursor, appliedFilters = filters) => {
    if (currentCursor) {
      setLoadingMoreExternal(true);
    } else {
      setLoadingExternal(true);
    }
    
    getExternalMovies(
      currentCursor,
      appliedFilters,
      (data) => {
        if (data?.shows) {
          setExternalMovies((prevMovies) => 
            currentCursor ? [...prevMovies, ...data.shows] : data.shows
          );
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        } else {
          setErrors("No se encontraron resultados.");
        }
        setLoadingExternal(false);
        setLoadingMoreExternal(false);
      },
      (errors) => {
        setErrors(errors);
        setLoadingExternal(false);
        setLoadingMoreExternal(false);
      }
    );
  };

  // Búsqueda de películas por título - modificada para recibir el título como parámetro
  const handleSearchMovies = (title) => {
    if (!title || !title.trim()) {
      setErrors("Por favor, introduce un título para buscar");
      return;
    }
    
    setSearchTitle(title);
    setIsSearching(true);
    setLoadingExternal(true);
    setExternalMovies([]);
    setCursor(null);
    setHasMore(false);
    
    searchMoviesByTitle(
      title,
      (data) => {
        if (data?.shows && data.shows.length > 0) {
          setExternalMovies(data.shows);
          setErrors(null);
        } else {
          setExternalMovies([]);
          setErrors(`No se encontraron películas con el título "${title}"`);
        }
        setLoadingExternal(false);
      },
      (error) => {
        setErrors(`Error al buscar películas: ${error.message}`);
        setLoadingExternal(false);
      }
    );
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTitle("");
    setIsSearching(false);
    setExternalMovies([]);
    fetchExternalMovies(null, filters);
  };

  const fetchTopRatedMovies = () => {
    setLoadingTopRated(true);
    
    // Apply filters for genre and year
    const genre = filters.genres.length === 1 ? 
      availableGenres.find(g => g.id === filters.genres[0])?.name : null;
      
    const year = filters.yearMin && filters.yearMin === filters.yearMax ? 
      parseInt(filters.yearMin) : null;
    
    getTopRatedMovies(
      genre,
      year,
      20, // pageSize
      0, // page
      (data) => {
        console.log("Top rated movies data:", data); // Para depuración
        
        // Procesamos los datos para agregar la URL de la imagen y la valoración media
        const processedData = data.map(movie => {
          // Verificar si ya existe una valoración media en los datos
          let ratingValue = null;
          
          // Comprobar si existe la propiedad averageRating y tiene un valor
          if (movie.averageRating !== undefined && movie.averageRating !== null) {
            ratingValue = typeof movie.averageRating === 'number' ? 
                          movie.averageRating : 
                          typeof movie.averageRating === 'string' ? 
                          parseFloat(movie.averageRating) : null;
          }
          
          return {
            ...movie,
            // Asegurar que haya una URL de imagen válida - utilizamos la URL de la imagen vertical del poster
            posterUrl: movie.posterUrl || movie.verticalPoster || 
              `https://image.tmdb.org/t/p/w500${movie.imdbId ? '/' + movie.imdbId : ''}.jpg`,
            // Usar la valoración correcta, priorizando la que viene del servidor
            averageRating: ratingValue
          };
        });
        
        console.log("Processed top rated movies:", processedData); // Para depuración
        
        setTopRatedMovies(processedData);
        setLoadingTopRated(false);
      },
      (error) => {
        console.error("Error fetching top rated movies:", error); // Para depuración
        setErrors(error);
        setLoadingTopRated(false);
      }
    );
  };
  
  // Effect to fetch movies based on selected source
  useEffect(() => {
    if (movieSource === 'external' && !isSearching) {
      fetchExternalMovies(null, filters);
    } else if (movieSource === 'topRated') {
      fetchTopRatedMovies();
    }
    
    return () => {
      // Cleanup function
      setExternalMovies([]);
      setTopRatedMovies([]);
      setErrors(null);
    };
  }, [movieSource]);

  // Handle filter submit
  const handleFilterSubmit = (newFilters) => {
    setFilters(newFilters);
    
    // Si estamos en modo búsqueda, volver al modo normal
    if (isSearching) {
      setIsSearching(false);
      setSearchTitle("");
    }
    
    if (movieSource === 'external') {
      setCursor(null);
      setExternalMovies([]);
      fetchExternalMovies(null, newFilters);
    } else {
      fetchTopRatedMovies();
    }
    
    setShowFilters(false);
  };

  // Handle loading more movies
  const handleLoadMore = () => {
    if (hasMore && cursor && !loadingMoreExternal && !isSearching) {
      fetchExternalMovies(cursor, filters);
    }
  };

  // Toggle movie source
  const handleSourceChange = (source) => {
    // Si estamos en modo búsqueda, limpiamos la búsqueda
    if (isSearching) {
      setIsSearching(false);
      setSearchTitle("");
    }
    
    setMovieSource(source);
  };

  // Available genres data
  const availableGenres = [
    { id: "1", name: "Acción" },
    { id: "2", name: "Aventura" },
    { id: "3", name: "Animación" },
    { id: "4", name: "Comedia" },
    { id: "5", name: "Crimen" },
    { id: "6", name: "Documental" },
    { id: "7", name: "Drama" },
    { id: "8", name: "Familiar" },
    { id: "9", name: "Fantasía" },
    { id: "10", name: "Historia" },
    { id: "11", name: "Terror" },
    { id: "12", name: "Música" },
    { id: "13", name: "Misterio" },
    { id: "14", name: "Romance" },
    { id: "15", name: "Ciencia Ficción" },
    { id: "16", name: "Thriller" },
    { id: "17", name: "Bélica" },
    { id: "18", name: "Western" }
  ];

  const orderOptions = [
    { value: "original_title", label: "Título" },
    { value: "popularity_1month", label: "Popularidad (1 mes)" },
    { value: "popularity_1week", label: "Popularidad (1 semana)" },
    { value: "year", label: "Año" },
    { value: "rating", label: "Valoración" },
  ];
  
  const languageOptions = [
    { value: "", label: "Todos" },
    { value: "es", label: "Español" },
    { value: "en", label: "Inglés" },
    { value: "fr", label: "Francés" },
    { value: "de", label: "Alemán" },
    { value: "it", label: "Italiano" },
    { value: "ja", label: "Japonés" },
    { value: "ko", label: "Coreano" },
    { value: "zh", label: "Chino" },
  ];

  // Filter external movies that have posters
  const filteredExternalMovies = externalMovies.filter(movie => {
    // Si tiene imageSet con verticalPoster, es válido
    if (movie.imageSet?.verticalPoster?.w240) {
      return true;
    }
    
    // Si tiene posterURLs de la API de búsqueda por título
    if (movie.posterURLs && (movie.posterURLs.w342 || movie.posterURLs.w500 || movie.posterURLs.original)) {
      return true;
    }
    
    // Si tiene la verticalPoster directamente en el objeto
    if (movie.verticalPoster) {
      return true;
    }
    
    // Si tiene posterUrl (del backend)
    if (movie.posterUrl) {
      return true;
    }
    
    // Si tiene una imagen básica
    if (movie.imageUrl) {
      return true;
    }
    
    return false;
  });

  return (
    <div className={`movie-explorer ${theme}`}>
      <div className="explorer-container">
        {/* Componente de búsqueda reemplazado por el nuevo SearchBar */}
        <SearchBar
          initialValue={searchTitle}
          onSearch={handleSearchMovies}
          onClear={clearSearch}
          isSearching={isSearching}
          theme={theme}
        />
        
        <MovieHeader 
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          movieSource={movieSource}
          onSourceChange={handleSourceChange}
          theme={theme}
          isSearching={isSearching}
        />
        
        {showFilters && !isSearching && (
          <MovieFilters
            filters={filters}
            availableGenres={availableGenres}
            orderOptions={orderOptions}
            languageOptions={languageOptions}
            onSubmit={handleFilterSubmit}
            theme={theme}
          />
        )}
        
        {errors && (
          <div className="error-container">
            <p className="error-message">
              {typeof errors === 'string' ? errors : errors.message || 'Ha ocurrido un error al cargar las películas'}
            </p>
          </div>
        )}

        <MovieResults 
          movieSource={isSearching ? "search" : movieSource}
          externalMovies={filteredExternalMovies}
          topRatedMovies={topRatedMovies}
          filters={filters}
          loadingExternal={loadingExternal}
          loadingMoreExternal={loadingMoreExternal}
          loadingTopRated={loadingTopRated}
          hasMore={hasMore && !isSearching}
          onLoadMore={handleLoadMore}
          onRetry={() => isSearching ? handleSearchMovies(searchTitle) : movieSource === 'external' ? fetchExternalMovies(null, filters) : fetchTopRatedMovies()}
          theme={theme}
          searchTitle={isSearching ? searchTitle : ""}
        />
      </div>
    </div>
  );
};

export default MovieExplorer;