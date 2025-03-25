package com.tfg.tfg.model.entities;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;

/**
 * Represents a Director entity in the system.
 */
@Entity
@Table(name = "Directors")
public class Director {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imdbId;
    private String firstName;
    private String lastName;
    
    @Temporal(TemporalType.DATE)
    private Date birthDate;
    
    private String birthPlace;
    private String starSign;
    private String height;
    
    @Lob
    private String bio;
    
    private String imageUrl;

    @JsonBackReference
    @ManyToMany(mappedBy = "directors")
    private List<Movie> movies;

    /**
     * Default constructor.
     */
    public Director() {}

    /**
     * Parameterized constructor to create a Director with the specified details.
     *
     * @param firstName the first name of the director
     * @param lastName the last name of the director
     */
    public Director(String firstName, String lastName, List<Movie> movies) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.movies = movies;
    }

    /**
     * Gets the ID of the director.
     *
     * @return the ID of the director
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the director.
     *
     * @param id the ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }
    
    /**
     * Gets the IMDB ID of the director.
     *
     * @return the IMDB ID of the director
     */
    public String getImdbId() {
        return imdbId;
    }

    /**
     * Sets the IMDB ID of the director.
     *
     * @param imdbId the IMDB ID to set
     */
    public void setImdbId(String imdbId) {
        this.imdbId = imdbId;
    }

    /**
     * Gets the first name of the director.
     *
     * @return the first name of the director
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * Sets the first name of the director.
     *
     * @param firstName the first name to set
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Gets the last name of the director.
     *
     * @return the last name of the director
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * Sets the last name of the director.
     *
     * @param lastName the last name to set
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    /**
     * Gets the birth date of the director.
     *
     * @return the birth date of the director
     */
    public Date getBirthDate() {
        return birthDate;
    }

    /**
     * Sets the birth date of the director.
     *
     * @param birthDate the birth date to set
     */
    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    /**
     * Gets the birth place of the director.
     *
     * @return the birth place of the director
     */
    public String getBirthPlace() {
        return birthPlace;
    }

    /**
     * Sets the birth place of the director.
     *
     * @param birthPlace the birth place to set
     */
    public void setBirthPlace(String birthPlace) {
        this.birthPlace = birthPlace;
    }

    /**
     * Gets the star sign of the director.
     *
     * @return the star sign of the director
     */
    public String getStarSign() {
        return starSign;
    }

    /**
     * Sets the star sign of the director.
     *
     * @param starSign the star sign to set
     */
    public void setStarSign(String starSign) {
        this.starSign = starSign;
    }

    /**
     * Gets the height of the director.
     *
     * @return the height of the director
     */
    public String getHeight() {
        return height;
    }

    /**
     * Sets the height of the director.
     *
     * @param height the height to set
     */
    public void setHeight(String height) {
        this.height = height;
    }

    /**
     * Gets the biography of the director.
     *
     * @return the biography of the director
     */
    public String getBio() {
        return bio;
    }

    /**
     * Sets the biography of the director.
     *
     * @param bio the biography to set
     */
    public void setBio(String bio) {
        this.bio = bio;
    }

    /**
     * Gets the image URL of the director.
     *
     * @return the image URL of the director
     */
    public String getImageUrl() {
        return imageUrl;
    }

    /**
     * Sets the image URL of the director.
     *
     * @param imageUrl the image URL to set
     */
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    /**
     * Gets the movies of the director.
     *
     * @return the movies of the director
     */
    public List<Movie> getMovies() {
        return movies;
    }

    /**
     * Sets the movies of the director.
     *
     * @param movies the movies to set
     */
    public void setMovies(List<Movie> movies) {
        this.movies = movies;
    }
}