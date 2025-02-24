import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetails } from "../../../backend/movieService";
import './ShowMovie.css';

const ShowMovie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [errors, setErrors] = useState(null);
  const [theme, setTheme] = useState('light'); // Estado para el tema

  useEffect(() => {
    getMovieDetails(
      id,
      (movie) => setMovie(movie),
      (errors) => setErrors(errors)
    );
  }, [id]);

  useEffect(() => {
    // Obtener el tema actual del body
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme);
  }, []);

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