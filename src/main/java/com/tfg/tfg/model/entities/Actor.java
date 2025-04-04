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

    private String imdbId;

    private String name;

    @Temporal(TemporalType.DATE)
    private Date birthDate;
    
    private String birthPlace;
    private String height;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private String imageUrl;

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
     * @param name the name of the actor
     * @param movies the movies of the actor
     */
    public Actor(String name, List<Movie> movies) {
        this.name = name;
        this.movies = movies;
    }

    /**
     * Extended constructor with all actor details.
     */
    public Actor(String name, Date birthDate, String birthPlace, 
                String height, String bio, String imageUrl, 
                String imdbId, List<Movie> movies) {
        this.name = name;
        this.birthDate = birthDate;
        this.birthPlace = birthPlace;
        this.height = height;
        this.bio = bio;
        this.imageUrl = imageUrl;
        this.imdbId = imdbId;
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
     * @return the name of the actor
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the first name of the actor.
     *
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
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

}