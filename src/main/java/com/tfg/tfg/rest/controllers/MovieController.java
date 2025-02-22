package com.tfg.tfg.rest.controllers;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.services.MovieService;
import com.tfg.tfg.rest.dtos.MovieConversor;
import com.tfg.tfg.rest.dtos.MovieDetailDto;
import com.tfg.tfg.rest.dtos.MovieListDto;
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
    public List<MovieListDto> getAllMovies() {
        return movieService.getAllMovies().stream()
                .map(MovieConversor::toMovieListDto)
                .toList();
    }

    /**
     * Endpoint to get a movie by its ID.
     *
     * @param id the ID of the movie
     * @return the movie if found, or a 404 status if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<MovieDetailDto> getMovieById(@PathVariable Long id) {
        Optional<Movie> movie = movieService.getMovieById(id);
        return movie.map(m -> ResponseEntity.ok(MovieConversor.toMovieDetailDto(m)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }
}