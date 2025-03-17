package com.tfg.tfg.model.entities;

import jakarta.persistence.*;

import java.sql.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
/**
 * Represents an Actor entity in the system.
 */
@Entity
@Table(name = "Actors")
public class Actor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Temporal(TemporalType.DATE)
    private Date birthDate;
    
    private String birthPlace;
    private String starSign;
    private String height;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private String imageUrl;
    private String tmdbId;

    @JsonBackReference
    @ManyToMany(mappedBy = "actors")
    private List<Movie> movies;

    /**
     * Default constructor.
     */
    public Actor() {}

    /**
     * Parameterized constructor to create an Actor with the specified details.
     *
     * @param firstName the first name of the actor
     * @param lastName the last name of the actor
     * @param movies the movies of the actor
     */
    public Actor(String firstName, String lastName, List<Movie> movies) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.movies = movies;
    }

    /**
     * Extended constructor with all actor details.
     */
    public Actor(String firstName, String lastName, Date birthDate, 
                String birthPlace, String starSign, String height, 
                String bio, String imageUrl, String tmdbId, List<Movie> movies) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.birthPlace = birthPlace;
        this.starSign = starSign;
        this.height = height;
        this.bio = bio;
        this.imageUrl = imageUrl;
        this.tmdbId = tmdbId;
        this.movies = movies;
    }

    /**
     * Gets the ID of the actor.
     *
     * @return the ID of the actor
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the actor.
     *
     * @param id the ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the first name of the actor.
     *
     * @return the first name of the actor
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * Sets the first name of the actor.
     *
     * @param firstName the first name to set
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Gets the last name of the actor.
     *
     * @return the last name of the actor
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * Sets the last name of the actor.
     *
     * @param lastName the last name to set
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * Gets the movies of the actor.
     *
     * @return the movies of the actor
     */
    public List<Movie> getMovies() {
        return movies;
    }

    /**
     * Sets the movies of the actor.
     *
     * @param movies the movies to set
     */
    public void setMovies(List<Movie> movies) {
        this.movies = movies;
    }

    /**
     * Adds a movie to the actor.
     *
     * @param movie the movie to add
     */
    public void addMovie(Movie movie) {
        this.movies.add(movie);
    }

    // Getters and setters for existing fields...
    
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
    
    public String getTmdbId() {
        return tmdbId;
    }
    
    public void setTmdbId(String tmdbId) {
        this.tmdbId = tmdbId;
    }

}