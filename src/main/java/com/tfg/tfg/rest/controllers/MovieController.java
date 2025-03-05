package com.tfg.tfg.rest.controllers;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.services.MovieService;
import com.tfg.tfg.rest.dtos.MovieConversor;
import com.tfg.tfg.rest.dtos.MovieDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    /**
     * Endpoint to get all movies.
     *
     * @return a list of all movies
     */
    @GetMapping("/allMovies")
    public List<MovieDto> getAllMovies() {
        return MovieConversor.toMovieDtos(movieService.getAllMovies());
    }

    /**
     * Endpoint to get a movie by its ID.
     *
     * @param id the ID of the movie
     * @return the movie if found, or a 404 status if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<MovieDto> getMovieById(@PathVariable Long id) {
        Optional<Movie> movie = movieService.getMovieById(id);
        return movie.map(value -> ResponseEntity.ok(MovieConversor.toMovieDto(value)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Endpoint to save a movie.
     *
     * @param movieDto the movie data transfer object
     * @return the saved movie
     */
    @PostMapping("/saveMovie")
    public ResponseEntity<MovieDto> saveMovie(@RequestBody MovieDto movieDto) {
        Movie movie = movieService.saveMovie(MovieConversor.toMovie(movieDto));
        return ResponseEntity.ok(MovieConversor.toMovieDto(movie));
    }
}