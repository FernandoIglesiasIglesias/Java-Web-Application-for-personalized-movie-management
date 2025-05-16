package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

import com.tfg.tfg.model.entities.Movie;

public interface MovieService {
    

    /**
     * Retrieves all movies.
     *
     * @return a list of all movies
     */
    public List<Movie> getAllMovies();

    /**
     * Retrieves a movie by its ID.
     *
     * @param id the ID of the movie
     * @return an Optional containing the movie if found, or empty if not found
     */
    public Optional<Movie> getMovieById(Long id);

    /**
     * Saves a movie.
     *
     * @param movie the movie to save
     * @return the saved movie
     */
    public Movie saveMovie(Movie movie);
    
}
