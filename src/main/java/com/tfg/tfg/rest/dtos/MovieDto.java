package com.tfg.tfg.rest.dtos;

import java.util.List;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.Genre;

public class MovieDto {

    private Long id;
    private String imbdId;
    private String title;
    private String overview;
    private int releaseYear;
    private String verticalPoster;
    private int runtime;
    
    private List<Genre> genres;
    private List<Actor> cast;
    private List<Director> directors;

    public MovieDto() {
    }

    public MovieDto(Long id, String imbdId, String title, String overview, int releaseYear, String verticalPoster, int runtime, List<Genre> genres, List<Actor> cast, List<Director> directors) {
        this.id = id;
        this.imbdId = imbdId;
        this.title = title;
        this.overview = overview;
        this.releaseYear = releaseYear;
        this.verticalPoster = verticalPoster;
        this.runtime = runtime;
        this.genres = genres;
        this.cast = cast;
        this.directors = directors;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImbdId() {
        return imbdId;
    }

    public void setImdbId(String tbdbId) {
        this.imbdId = tbdbId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOverview() {
        return overview;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public int getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(int releaseYear) {
        this.releaseYear = releaseYear;
    }

    public String getVerticalPoster() {
        return verticalPoster;
    }

    public void setVerticalPoster(String verticalPoster) {
        this.verticalPoster = verticalPoster;
    }

    public int getRuntime() {
        return runtime;
    }

    public void setRuntime(int runtime) {
        this.runtime = runtime;
    }

    public List<Genre> getGenres() {
        return genres;
    }

    public void setGenres(List<Genre> genres) {
        this.genres = genres;
    }

    public List<Actor> getCast() {
        return cast;
    }

    public void setCast(List<Actor> cast) {
        this.cast = cast;
    }

    public List<Director> getDirectors() {
        return directors;
    }

    public void setDirectors(List<Director> directors) {
        this.directors = directors;
    }
}