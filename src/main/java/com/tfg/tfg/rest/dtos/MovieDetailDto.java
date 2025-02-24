package com.tfg.tfg.rest.dtos;

import java.util.List;

public class MovieDetailDto {
    private String title;
    private String synopsis;
    private int duration;
    private String genre;
    private List<ActorDto> actors;
    private List<DirectorDto> directors;

    public MovieDetailDto(String title, String synopsis, int duration, String genre, List<ActorDto> actors, List<DirectorDto> directors) {
        this.title = title;
        this.synopsis = synopsis;
        this.duration = duration;
        this.genre = genre;
        this.actors = actors;
        this.directors = directors;
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

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
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