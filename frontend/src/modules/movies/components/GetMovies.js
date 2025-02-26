import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMovies } from "../../../backend/movieService";
import './GetMovies.css';

const GetMovies = () => {
  const [movies, setMovies] = useState([]);
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllMovies(
      (movies) => setMovies(movies),
      (errors) => setErrors(errors)
    );
  }, []);

  const handleMovieClick = (id) => {
    navigate(`/movies/${id}`);
  };

  return (
    <div className="movies-list">
      {errors && <p className="error-message">{errors}</p>}
      {movies.map((movie) => (
        <button key={movie.id} className="movie-item" onClick={() => handleMovieClick(movie.id)}>
          <h3>{movie.title}</h3>
          <p>{movie.synopsis}</p>
        </button>
      ))}
    </div>
  );
};

export default GetMovies;