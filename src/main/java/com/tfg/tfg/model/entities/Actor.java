package com.tfg.tfg.model.entities;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
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
    private String nationality;
    private LocalDate birthDate;

    @ManyToMany(mappedBy = "actors", fetch = FetchType.LAZY)
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
     * @param nationality the nationality of the actor
     * @param birthDate the birth date of the actor
     */
    public Actor(String firstName, String lastName, String nationality, LocalDate birthDate) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.nationality = nationality;
        this.birthDate = birthDate;
        this.movies = new ArrayList<>();
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
     * Gets the nationality of the actor.
     *
     * @return the nationality of the actor
     */
    public String getNationality() {
        return nationality;
    }

    /**
     * Sets the nationality of the actor.
     *
     * @param nationality the nationality to set
     */
    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    /**
     * Gets the birth date of the actor.
     *
     * @return the birth date of the actor
     */
    public LocalDate getBirthDate() {
        return birthDate;
    }

    /**
     * Sets the birth date of the actor.
     *
     * @param birthDate the birth date to set
     */
    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
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
}