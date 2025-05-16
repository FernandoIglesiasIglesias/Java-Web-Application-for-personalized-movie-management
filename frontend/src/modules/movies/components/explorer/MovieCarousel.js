import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import MovieCard from './MovieCard';
import './MovieCarousel.css';

const MovieCarousel = ({ movies, onMovieClick, theme }) => {
  const moviesListRef = useRef(null);

  const scrollMovies = (direction) => {
    if (moviesListRef.current) {
      const containerWidth = moviesListRef.current.clientWidth;
      const scrollAmount = containerWidth * 0.8; // 80% of container width
      
      moviesListRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="movies-carousel-container">
      <button
        className={`carousel-button left ${theme}`}
        onClick={() => scrollMovies("left")}
        aria-label="Desplazar a la izquierda"
      >
        <span className="arrow">&#9664;</span>
      </button>
      
      <div className="movies-list-container" ref={moviesListRef}>
        <div className="movies-list">
          {movies.map((movie) => (
            <MovieCard 
              key={`${movie.id || movie.imdbId}`}
              movie={{
                id: movie.id,
                imdbId: movie.ids?.imdb || movie.imdbId,
                title: movie.title,
                posterUrl: movie.imageSet?.verticalPoster?.w240 || movie.posterUrl,
                year: movie.releaseYear || movie.year,
                rating: movie.imdbRating || movie.rating,
                genres: (movie.genres || []).slice(0, 2).map(g => typeof g === 'string' ? g : g.name)
              }}
              onClick={onMovieClick}
              theme={theme}
              source="external"
            />
          ))}
        </div>
      </div>
      
      <button
        className={`carousel-button right ${theme}`}
        onClick={() => scrollMovies("right")}
        aria-label="Desplazar a la derecha"
      >
        <span className="arrow">&#9654;</span>
      </button>
    </div>
  );
};

MovieCarousel.propTypes = {
  movies: PropTypes.array.isRequired,
  onMovieClick: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired
};

export default MovieCarousel;