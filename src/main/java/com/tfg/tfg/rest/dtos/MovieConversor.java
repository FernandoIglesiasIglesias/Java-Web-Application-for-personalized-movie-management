package com.tfg.tfg.rest.dtos;

import com.tfg.tfg.model.entities.Movie;

import java.util.List;

public class MovieConversor {

    private MovieConversor() {}

    public static MovieDto toMovieDto(Movie movie) {
        return new MovieDto(movie.getId(), movie.getImbdId(), movie.getTitle(), movie.getOverview(), movie.getReleaseYear(), movie.getVerticalPoster(), movie.getRuntime(), movie.getGenres(),movie.getActors(), movie.getDirectors());
    }

    public static List<MovieDto> toMovieDtos(List<Movie> movies) {
        return movies.stream()
                     .map(MovieConversor::toMovieDto)
                     .toList();
    }

    public static Movie toMovie(MovieDto movieDto) {
        return new Movie(movieDto.getImbdId(), movieDto.getTitle(), movieDto.getOverview(), movieDto.getReleaseYear(), movieDto.getVerticalPoster(), movieDto.getRuntime(), movieDto.getGenres(), movieDto.getCast(), movieDto.getDirectors());
    }    
}