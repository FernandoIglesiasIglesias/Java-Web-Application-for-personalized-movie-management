import React from 'react';
import MovieCard from '../../explorer/MovieCard';
import './MovieRecommendations.css';

const MovieRecommendationList = ({ movies, onMovieClick, theme }) => {
  // Asegurarse de que movies es un array
  const safeMovies = Array.isArray(movies) ? movies : [];

  return (
    <div className="movie-recommendation-grid">
      {safeMovies.map((movie, index) => (
        <MovieCard 
          key={`${movie.id || movie.imdbId || index}`}
          movie={{
            id: movie.id,
            imdbId: movie.imdbId,
            title: movie.title || 'Sin título',
            posterUrl: movie.posterUrl || movie.imageUrl,
            year: movie.releaseYear || movie.year,
            rating: movie.imdbRating || movie.rating,
            userRating: movie.averageRating,
            genres: Array.isArray(movie.genres) ? 
              movie.genres.map(g => typeof g === 'object' ? g.name : g).slice(0, 2) : []
          }}
          onClick={onMovieClick}
          theme={theme}
          source="recommendations"
        />
      ))}
    </div>
  );
};

export default MovieRecommendationList;