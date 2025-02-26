import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { getMovieDetails } from "../../../backend/movieService";
import './ShowMovie.css';

const ShowMovie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [errors, setErrors] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    getMovieDetails(
      id,
      (movie) => setMovie(movie),
      (errors) => setErrors(errors)
    );
  }, [id]);

  if (errors) {
    return <p className="error-message">{errors}</p>;
  }

  if (!movie) {
    return <p>Loading...</p>;
  }

  return (
    <div className={`movie-details ${theme}`}>
      <h1>{movie.title}</h1>
      <p>{movie.synopsis}</p>
      <p>Duration: {movie.duration} minutes</p>
      <p>Genre: {movie.genre}</p>
      <h2>Actors</h2>
      <ul>
        {movie.actors.map((actor) => (
          <li key={actor.id}>{actor.firstName} {actor.lastName}</li>
        ))}
      </ul>
      <h2>Directors</h2>
      <ul>
        {movie.directors.map((director) => (
          <li key={director.id}>{director.firstName} {director.lastName}</li>
        ))}
      </ul>
    </div>
  );
};

export default ShowMovie;