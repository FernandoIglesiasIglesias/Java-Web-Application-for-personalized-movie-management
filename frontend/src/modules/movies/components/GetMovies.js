import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getExternalMovies } from "../../../backend/movieService";
import "./GetMovies.css";

const GetMovies = () => {
  const [movies, setMovies] = useState([]);
  const [errors, setErrors] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const navigate = useNavigate();
  const moviesListRef = useRef(null);

  const fetchMovies = (cursor) => {
    getExternalMovies(
      cursor,
      (data) => {
        if (data?.shows) {
          setMovies((prevMovies) => [...prevMovies, ...data.shows]);
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        } else {
          setErrors("No se encontraron resultados.");
        }
      },
      (errors) => setErrors(errors)
    );
  };

  useEffect(() => {
    fetchMovies(null);
  }, []);

  const scrollMovies = (direction) => {
    if (moviesListRef.current) {
      const scrollAmount = 900; // Mayor desplazamiento
      moviesListRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMovieClick = (imdbId) => {
    navigate(`/movies/${imdbId}`);
  };

  return (
    <div className="movies-container">
      <h2>Películas más populares del último mes</h2>
      {errors && <p className="error-message">{errors.message || errors}</p>}
      <div className="movies-wrapper">
        <button
          className="scroll-button left"
          onClick={() => scrollMovies("left")}
        >
          ◀
        </button>
        <div className="movies-list-container" ref={moviesListRef}>
          <div className="movies-list">
            {movies.map((movie, index) => (
              <div
                key={`${movie.id}-${index}`}
                className="movie-item"
                onClick={() => handleMovieClick(movie.id)}
              >
                <img
                  src={movie.imageSet?.verticalPoster?.w240}
                  alt={movie.title}
                />
                <h3>{movie.title}</h3>
              </div>
            ))}
          </div>
        </div>
        <button
          className="scroll-button right"
          onClick={() => scrollMovies("right")}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default GetMovies;
