package com.tfg.tfg.model.entities;

import java.util.List;

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

    private String firstName;
    private String lastName;

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