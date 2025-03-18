package com.tfg.tfg.rest.dtos;

import java.sql.Date;
import java.util.List;

public class ActorDto {
    private Long id;
    private String firstName;
    private String lastName;

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

    public ActorDto(Long id, String firstName, String lastName) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public ActorDto(Long id, String firstName, String lastName, Date birthDate, String birthPlace, String starSign, String height, String bio, String imageUrl, String imdbId, List<MovieDto> movies) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.birthPlace = birthPlace;
        this.starSign = starSign;
        this.height = height;
        this.bio = bio;
        this.imageUrl = imageUrl;
        this.imdbId = imdbId;
        this.movies = movies;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
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