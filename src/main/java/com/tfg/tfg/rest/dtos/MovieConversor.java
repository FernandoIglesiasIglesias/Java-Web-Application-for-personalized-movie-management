package com.tfg.tfg.rest.dtos;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.Genre;
import com.tfg.tfg.model.entities.Movie;

import java.util.ArrayList;
import java.util.List;

public class MovieConversor {

    private MovieConversor() {}

    public static MovieDto toMovieDto(Movie movie) {
        if (movie == null) return null;
        
        // Crear objetos DTO simplificados para géneros
        List<GenreDto> genreDtos = movie.getGenres() != null ? 
            movie.getGenres().stream()
                .map(genre -> new GenreDto(genre.getId(), genre.getName()))
                .toList() : 
            new ArrayList<>();
        
        // Crear objetos DTO simplificados para actores
        List<ActorDto> actorDtos = movie.getActors() != null ? 
            movie.getActors().stream()
                .map(actor -> new ActorDto(actor.getId(), actor.getFirstName(), actor.getLastName()))
                .toList() : 
            new ArrayList<>();
        
        // Crear objetos DTO simplificados para directores
        List<DirectorDto> directorDtos = movie.getDirectors() != null ? 
            movie.getDirectors().stream()
                .map(director -> new DirectorDto(director.getId(), director.getFirstName(), director.getLastName()))
                .toList() : 
            new ArrayList<>();
        
        return new MovieDto(
            movie.getId(), 
            movie.getImdbId(), 
            movie.getTitle(), 
            movie.getOverview(), 
            movie.getReleaseYear(), 
            movie.getVerticalPoster(), 
            movie.getRuntime(),
            genreDtos,
            actorDtos,
            directorDtos
        );
    }

    public static List<MovieDto> toMovieDtos(List<Movie> movies) {
        if (movies == null) return new ArrayList<>();
        
        return movies.stream()
                     .map(MovieConversor::toMovieDto)
                     .toList();
    }

    public static Movie toMovie(MovieDto movieDto) {
        if (movieDto == null) return null;
        
        // Crear listas vacías o convertir DTOs a entidades
        List<Genre> genres = new ArrayList<>();
        List<Actor> actors = new ArrayList<>();
        List<Director> directors = new ArrayList<>();
        
        if (movieDto.getGenres() != null) {
            genres = movieDto.getGenres().stream()
                .map(genreDto -> {
                    Genre genre = new Genre();
                    genre.setId(genreDto.getId());
                    genre.setName(genreDto.getName());
                    // No establecemos la relación inversa aquí para evitar recursión
                    return genre;
                })
                .toList();
        }
        
        if (movieDto.getCast() != null) {
            actors = movieDto.getCast().stream()
                .map(actorDto -> {
                    Actor actor = new Actor();
                    actor.setId(actorDto.getId());
                    actor.setFirstName(actorDto.getFirstName());
                    actor.setLastName(actorDto.getLastName());
                    // No establecemos la relación inversa aquí para evitar recursión
                    return actor;
                })
                .toList();
        }
        
        if (movieDto.getDirectors() != null) {
            directors = movieDto.getDirectors().stream()
                .map(directorDto -> {
                    Director director = new Director();
                    director.setId(directorDto.getId());
                    director.setFirstName(directorDto.getFirstName());
                    director.setLastName(directorDto.getLastName());
                    // No establecemos la relación inversa aquí para evitar recursión
                    return director;
                })
                .toList();
        }
        
        return new Movie(
            movieDto.getImdbId(), 
            movieDto.getTitle(), 
            movieDto.getOverview(), 
            movieDto.getReleaseYear(), 
            movieDto.getVerticalPoster(), 
            movieDto.getRuntime(), 
            genres, 
            actors, 
            directors
        );
    }
}