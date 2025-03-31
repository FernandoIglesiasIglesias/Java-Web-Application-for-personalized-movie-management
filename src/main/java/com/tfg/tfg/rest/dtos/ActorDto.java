package com.tfg.tfg.rest.dtos;

import java.sql.Date;
import java.util.List;

public class ActorDto {
    private Long id;
    private String name;

    private Date birthDate;
    private String birthPlace;
    private String starSign;
    private String height;
    private String bio;
    private String imageUrl;
    private String imdbId;
    private List<MovieDto> movies;

    public ActorDto() {
    }

    public ActorDto(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public ActorDto(Long id, String name, String imdbId, 
                   Date birthDate, String birthPlace, 
                   String starSign, String height, 
                   String bio, String imageUrl) {
        this.id = id;
        this.name = name;
        this.imdbId = imdbId;
        this.birthDate = birthDate;
        this.birthPlace = birthPlace;
        this.starSign = starSign;
        this.height = height;
        this.bio = bio;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
    
    public String getStarSign() {
        return starSign;
    }
    
    public void setStarSign(String starSign) {
        this.starSign = starSign;
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
    
    public String getImdbId() {
        return imdbId;
    }
    
    public void setImdbId(String imdbId) {
        this.imdbId = imdbId;
    }

    public List<MovieDto> getMovies() {
        return movies;
    }

    public void setMovies(List<MovieDto> movies) {
        this.movies = movies;
    }

}