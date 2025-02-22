package com.tfg.tfg.rest.dtos;

import java.util.List;

import com.tfg.tfg.model.entities.Genre;

public class MovieListDto {
    private Long id;
    private String title;
    private String synopsis;
    private int duration;
    private Genre genre;
    private List<ActorDto> actors;
    private List<DirectorDto> directors;

    public MovieListDto(Long id, String title, String synopsis, int duration, Genre genre, List<ActorDto> actors, List<DirectorDto> directors) {
        this.id = id;
        this.title = title;
        this.synopsis = synopsis;
        this.duration = duration;
        this.genre = genre;
        this.actors = actors;
        this.directors = directors;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public Genre getGenre() {
        return genre;
    }

    public void setGenre(Genre genre) {
        this.genre = genre;
    }

    public List<ActorDto> getActors() {
        return actors;
    }

    public void setActors(List<ActorDto> actors) {
        this.actors = actors;
    }

    public List<DirectorDto> getDirectors() {
        return directors;
    }

    public void setDirectors(List<DirectorDto> directors) {
        this.directors = directors;
    }
}