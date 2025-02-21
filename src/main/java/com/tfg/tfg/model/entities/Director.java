package com.tfg.tfg.model.entities;

import jakarta.persistence.*;
import java.util.Set;

/**
 * Represents a Director entity in the system.
 */
@Entity
public class Director {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String nationality;
    private java.sql.Date birthDate;

    @ManyToMany(mappedBy = "directors")
    private Set<Movie> movies;

    /**
     * Default constructor.
     */
    public Director() {}

    /**
     * Parameterized constructor to create a Director with the specified details.
     *
     * @param firstName the first name of the director
     * @param lastName the last name of the director
     * @param nationality the nationality of the director
     * @param birthDate the birth date of the director
     */
    public Director(String firstName, String lastName, String nationality, java.sql.Date birthDate) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.nationality = nationality;
        this.birthDate = birthDate;
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
     * Gets the nationality of the director.
     *
     * @return the nationality of the director
     */
    public String getNationality() {
        return nationality;
    }

    /**
     * Sets the nationality of the director.
     *
     * @param nationality the nationality to set
     */
    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    /**
     * Gets the birth date of the director.
     *
     * @return the birth date of the director
     */
    public java.sql.Date getBirthDate() {
        return birthDate;
    }

    /**
     * Sets the birth date of the director.
     *
     * @param birthDate the birth date to set
     */
    public void setBirthDate(java.sql.Date birthDate) {
        this.birthDate = birthDate;
    }

    /**
     * Gets the movies of the director.
     *
     * @return the movies of the director
     */
    public Set<Movie> getMovies() {
        return movies;
    }

    /**
     * Sets the movies of the director.
     *
     * @param movies the movies to set
     */
    public void setMovies(Set<Movie> movies) {
        this.movies = movies;
    }
}