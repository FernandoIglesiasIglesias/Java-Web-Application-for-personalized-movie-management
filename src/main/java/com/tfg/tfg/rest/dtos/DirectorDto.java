package com.tfg.tfg.rest.dtos;

import java.util.Date;
import java.util.List;

public class DirectorDto {
    
    private Long id;
    private String imdbId;
    private String name;
    private Date birthDate;    
    private String birthPlace;
    private String height;
    private String bio;
    private String imageUrl;
    private List<MovieDto> movies;
    
    public DirectorDto() {}

    public DirectorDto(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public DirectorDto(Long id, String name, String imdbId) {
        this.id = id;
        this.name = name;
        this.imdbId = imdbId;
    }
    
    public DirectorDto(Long id, String imdbId, String name, Date birthDate, 
                      String birthPlace, String height, String bio, String imageUrl, 
                      List<MovieDto> movies) {
        this.id = id;
        this.imdbId = imdbId;
        this.name = name;
        this.birthDate = birthDate;
        this.birthPlace = birthPlace;
        this.height = height;
        this.bio = bio;
        this.imageUrl = imageUrl;
        this.movies = movies;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getImdbId() {
        return imdbId;
    }
    
    public void setImdbId(String imdbId) {
        this.imdbId = imdbId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Date getBirthDate() {
        return birthDate;
    }
    
    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }
    
    public String getBirthPlace() {
        return birthPlace;
    }
    
    public void setBirthPlace(String birthPlace) {
        this.birthPlace = birthPlace;
    }
    
    public String getHeight() {
        return height;
    }
    
    public void setHeight(String height) {
        this.height = height;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public List<MovieDto> getMovies() {
        return movies;
    }
    
    public void setMovies(List<MovieDto> movies) {
        this.movies = movies;
    }
}