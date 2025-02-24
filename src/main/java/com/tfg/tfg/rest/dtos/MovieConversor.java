package com.tfg.tfg.rest.dtos;

import com.tfg.tfg.model.entities.Movie;

import java.util.List;
import java.util.stream.Collectors;

public class MovieConversor {

    private MovieConversor() {}

    public static MovieListDto toMovieListDto(Movie movie) {
        List<ActorDto> actorDtos = movie.getActors().stream()
                .map(actor -> new ActorDto(actor.getId(), actor.getFirstName(), actor.getLastName(), actor.getNationality(), actor.getBirthDate()))
                .collect(Collectors.toList());

        List<DirectorDto> directorDtos = movie.getDirectors().stream()
                .map(director -> new DirectorDto(director.getId(), director.getFirstName(), director.getLastName(), director.getNationality(), director.getBirthDate()))
                .collect(Collectors.toList());

        return new MovieListDto(
            movie.getId(),
            movie.getTitle(),
            movie.getSynopsis(),
            movie.getDuration(),
            movie.getGenre(),
            actorDtos,
            directorDtos
        );
    }

    public static MovieDetailDto toMovieDetailDto(Movie movie) {
        List<ActorDto> actorDtos = movie.getActors().stream()
                .map(actor -> new ActorDto(actor.getId(), actor.getFirstName(), actor.getLastName(), actor.getNationality(), actor.getBirthDate()))
                .collect(Collectors.toList());

        List<DirectorDto> directorDtos = movie.getDirectors().stream()
                .map(director -> new DirectorDto(director.getId(), director.getFirstName(), director.getLastName(), director.getNationality(), director.getBirthDate()))
                .collect(Collectors.toList());

        return new MovieDetailDto(
            movie.getTitle(),
            movie.getSynopsis(),
            movie.getDuration(),
            movie.getGenre().name(),
            actorDtos,
            directorDtos
        );
    }
}