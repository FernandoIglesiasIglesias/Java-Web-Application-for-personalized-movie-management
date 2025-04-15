import React from 'react';
import PropTypes from 'prop-types';
import MovieCard from './MovieCard';
import './MovieGrid.css';

const MovieGrid = ({ movies, onMovieClick, theme, source }) => {  
  return (
    <div className="movies-grid-container">
      <div className="movies-grid">
        {movies.map((movie) => {          
          return (
            <MovieCard 
              key={`${movie.id || movie.imdbId}`}
              movie={{
                id: movie.id,
                imdbId: movie.imdbId,
                title: movie.title,
                posterUrl: movie.posterUrl,
                year: movie.releaseYear || movie.year,
                rating: movie.imdbRating || movie.rating,
                // Asignar correctamente la valoración de usuarios
                userRating: movie.averageRating,
                genres: (movie.genres || [])
                  .map(g => typeof g === 'string' ? g : g.name)
                  .filter(Boolean)
                  .slice(0, 2)
              }}
              onClick={onMovieClick}
              theme={theme}
              source={source}
            />
          );
        })}
      </div>
    </div>
  );
};

MovieGrid.propTypes = {
  movies: PropTypes.array.isRequired,
  onMovieClick: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  source: PropTypes.string
};

MovieGrid.defaultProps = {
  source: 'external'
};

export default MovieGrid;