import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext"; // Importamos el hook
import { saveMovie } from "../../../backend/movieService"; // Importa la función saveMovie
import "./ShowMovie.css";

const ShowMovie = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);

  const parseMovieJson = (json) => {
    const parseName = (name) => {
      const [firstName, ...lastNameParts] = name.split(" ");
      return {
        firstName,
        lastName: lastNameParts.join(" ")
      };
    };
  
    return {
      imbdId: json.imdbId,
      title: json.title,
      overview: json.overview,
      releaseYear: json.releaseYear,
      verticalPoster: json.imageSet.verticalPoster.w720,
      runtime: json.runtime,
      genres: json.genres.map(genre => ({
        name: genre.name
      })),
      cast: json.cast.map(parseName),
      directors: json.directors.map(parseName)
    };
  };

  useEffect(() => {
    fetch(
      `https://streaming-availability.p.rapidapi.com/shows/${id}?series_granularity=episode&output_language=es`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
          "x-rapidapi-key": "cb332fab10msh89e2fc877672ccfp14515bjsn3b00399489a8",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const parsedData = parseMovieJson(data);
        setMovie(parsedData);
        saveMovie(parsedData, () => console.log("Movie saved successfully"), (error) => console.error("Error saving movie", error));
      })
      .catch((error) => setError(error));
  }, [id]);

  if (error) {
    return <div className="error-message">Error: {error.message}</div>;
  }

  if (!movie) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className={`movie-details ${theme}`}>
      <div className="movie-header">
        <h1>{movie.title || "Título no disponible"}</h1>
      </div>
      <div className="movie-content">
        <div className="movie-poster">
          {movie.verticalPoster && (
            <img
              src={movie.verticalPoster}
              alt={movie.title || "Imagen de la película"}
            />
          )}
        </div>
        <div className="movie-info">
          <p><strong>Descripción:</strong> {movie.overview || "Sin descripción disponible."}</p>
          <p><strong>Año estreno:</strong> {movie.releaseYear || "Desconocido"}</p>
          <p><strong>Género:</strong> {movie.genres?.map((genre) => genre.name).join(", ") || "No disponible"}</p>
          <p><strong>Director:</strong> {movie.directors?.map(director => `${director.firstName} ${director.lastName}`).join(", ") || "No disponible"}</p>
          <p><strong>Casting:</strong> {movie.cast?.map(actor => `${actor.firstName} ${actor.lastName}`).join(", ") || "No disponible"}</p>
          <p><strong>Duración:</strong> {movie.runtime ? `${movie.runtime} minutos` : "No disponible"}</p>
        </div>
      </div>
      <div className="streaming-options">
        <h2>Disponible en:</h2>
        {movie.streamingOptions?.es && movie.streamingOptions.es.length > 0 ? (
          <div className="platforms">
            {movie.streamingOptions.es.map((option) => (
              <a
                key={option.service.id}
                href={option.link}
                target="_blank"
                rel="noopener noreferrer"
                className="platform"
              >
                <img
                  src={option.service.imageSet?.lightThemeImage}
                  alt={option.service.name || "Plataforma"}
                />
              </a>
            ))}
          </div>
        ) : (
          <p>No disponible en ninguna plataforma.</p>
        )}
      </div>
    </div>
  );
};

export default ShowMovie;