import React from "react";
import "./MovieInfo.css"

const MovieInfo = ({ movie, theme, averageRating, loadingRating, navigate }) => {
  return (
    <div className="movie-info-container">
      <div className={`movie-header-info ${theme}`}>
        <h1 className={`movie-title ${theme}`}>{movie.title || "Título no disponible"}</h1>
        
        <div className="movie-meta">
          {movie.releaseYear && <span className={`movie-year ${theme}`}>{movie.releaseYear}</span>}
          {movie.runtime && <span className={`movie-runtime ${theme}`}>{movie.runtime} min</span>}
          {movie.imdbRating && (
            <span className="movie-rating">
              <span className="star-icon">★</span> 
              <span className="rating-value">IMDB: {movie.imdbRating.toFixed(1)}</span>
            </span>
          )}
          
          {/* Valoraciones de usuarios */}
          <div className="user-rating-container">
            {loadingRating ? (
              <div className="rating-loading">
                <div className={`mini-spinner ${theme}`}></div>
              </div>
            ) : (
              <>
                {averageRating ? (
                  <span className="movie-user-rating">
                    <span className="user-star-icon">★</span> 
                    <span className="user-rating-value">Usuarios: {averageRating.toFixed(1)}</span>
                  </span>
                ) : (
                  <span className="movie-no-rating">
                    <span className="no-rating-icon">☆</span>
                    <span className="no-rating-text">Sin valoraciones</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        
        {movie.genres && movie.genres.length > 0 && (
          <div className="movie-genres">
            {movie.genres.map((genre, index) => (
              <span key={index} className={`genre-tag ${theme}`}>{genre.name}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="movie-section">
        <h2>Sinopsis</h2>
        <p className={`movie-overview ${theme}`}>{movie.overview || "No hay sinopsis disponible para esta película."}</p>
      </div>
      
      <div className="movie-section">
        <h2>Detalles</h2>
        <div className="movie-details-grid">
          {movie.directors && movie.directors.length > 0 && (
            <div className={`detail-item ${theme}`}>
              <h3>Dirección</h3>
              <div className="directors-list">
                {movie.directors.slice(0, 6).map((director, index) => (
                  <span 
                    key={index} 
                    className={`director-member ${theme}`}
                    onClick={() => navigate(`/directors/${encodeURIComponent(director.name)}`)}
                  >
                    {director.name}
                  </span>
                ))}
                {movie.directors.length > 6 && 
                  <span className={`director-more ${theme}`}>+{movie.directors.length - 6} más</span>
                }
              </div>
            </div>
          )}
          
          {movie.cast && movie.cast.length > 0 && (
            <div className={`detail-item ${theme}`}>
              <h3>Reparto principal</h3>
              <div className="cast-list">
                {movie.cast.slice(0, 8).map((actor, index) => (
                  <span 
                    key={index} 
                    className={`cast-member ${theme}`}
                    onClick={() => navigate(`/actors/${actor.imdbId || encodeURIComponent(actor.name)}`)}
                  >
                    <span className="actor-name">{actor.name}</span>
                    {actor.character && <span className={`character-name ${theme}`}>{actor.character}</span>}
                  </span>
                ))}
                {movie.cast.length > 8 && 
                  <span className={`cast-more ${theme}`}>+{movie.cast.length - 8} más</span>
                }
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Opciones de streaming */}
      <div className="movie-section streaming-section">
        <h2>Dónde ver</h2>
        {movie.streamingOptions?.es && movie.streamingOptions.es.length > 0 ? (
          <div className="streaming-platforms">
            {movie.streamingOptions.es.map((option) => (
              <a
                key={option.service.id}
                href={option.link}
                target="_blank"
                rel="noopener noreferrer"
                className="platform-item"
                title={`Ver en ${option.service.name}`}
              >
                <img
                  src={theme === 'dark' && option.service.imageSet?.darkThemeImage 
                    ? option.service.imageSet.darkThemeImage 
                    : option.service.imageSet?.lightThemeImage}
                  alt={option.service.name}
                  className={`platform-logo ${theme}`}
                />
                <span className={`platform-name ${theme}`}>{option.service.name}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className={`no-streaming ${theme}`}>No disponible actualmente en plataformas de streaming.</p>
        )}
      </div>
    </div>
  );
};

export default MovieInfo;