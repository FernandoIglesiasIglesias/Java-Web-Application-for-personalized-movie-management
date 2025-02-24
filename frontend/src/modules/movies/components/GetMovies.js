// filepath: /home/oem/software/tfg/frontend/src/modules/movies/components/GetMovies.js
import React, { useEffect, useState } from "react";
import { getAllMovies } from "../../../backend/movieService";
import './GetMovies.css';

const GetMovies = () => {
  const [movies, setMovies] = useState([]);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    getAllMovies(
      (movies) => setMovies(movies),
      (errors) => setErrors(errors)
    );
  }, []);

  return (
    <div className="movies-list">
      {errors && <p className="error-message">{errors}</p>}
      {movies.map((movie) => (
        <div key={movie.id} className="movie-item">
          <h3>{movie.title}</h3>
          <p>{movie.synopsis}</p>
        </div>
      ))}
    </div>
  );
};

export default GetMovies;