package com.tfg.tfg.rest.dtos;

import java.util.List;

public class MovieDto {
    private Long id;
    private String imbdId;
    private String title;
    private String overview;
    private int releaseYear;
    private String verticalPoster;
    private int runtime;
    
    private List<GenreDto> genres;
    private List<ActorDto> cast;
    private List<DirectorDto> directors;
    
    public MovieDto() {
    }
    
    public MovieDto(Long id, String imbdId, String title, String overview, int releaseYear, 
                  String verticalPoster, int runtime, List<GenreDto> genres, 
                  List<ActorDto> cast, List<DirectorDto> directors) {
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
    
    // Getters y setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getImbdId() {
        return imbdId;
    }
    
    public void setImbdId(String imbdId) {
        this.imbdId = imbdId;
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
    
    public List<GenreDto> getGenres() {
        return genres;
    }
    
    public void setGenres(List<GenreDto> genres) {
        this.genres = genres;
    }
    
    public List<ActorDto> getCast() {
        return cast;
    }
    
    public void setCast(List<ActorDto> cast) {
        this.cast = cast;
    }
    
    public List<DirectorDto> getDirectors() {
        return directors;
    }
    
    public void setDirectors(List<DirectorDto> directors) {
        this.directors = directors;
    }
}