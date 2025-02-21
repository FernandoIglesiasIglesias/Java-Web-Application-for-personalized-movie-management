package com.tfg.tfg.model.entities;

import java.util.Set;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;

/**
 * Represents a Movie entity in the system.
 */
@Entity
public class Movie {

    /**
     * Enum representing the genre of a movie.
     */
    public enum Genre {ACTION, COMEDY, DRAMA, HORROR, ROMANCE, SCI_FI, THRILLER}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String synopsis;
    private int duration;

    @Enumerated(EnumType.STRING)
    private Genre genre;

    @ManyToMany
    @JoinTable(
        name = "MovieActors",
        joinColumns = @JoinColumn(name = "movieId"),
        inverseJoinColumns = @JoinColumn(name = "actorId")
    )
    private Set<Actor> actors;

    @ManyToMany
    @JoinTable(
        name = "MovieDirectors",
        joinColumns = @JoinColumn(name = "movieId"),
        inverseJoinColumns = @JoinColumn(name = "directorId")
    )
    private Set<Director> directors;

    /**
     * Default constructor.
     */
    public Movie() {}

    /**
     * Parameterized constructor to create a Movie with the specified details.
     *
     * @param title the title of the movie
     * @param synopsis the synopsis of the movie
     * @param duration the duration of the movie
     * @param genre the genre of the movie
     */
    public Movie(String title, String synopsis, int duration, Genre genre) {
        this.title = title;
        this.synopsis = synopsis;
        this.duration = duration;
        this.genre = genre;
    }

    /**
     * Gets the ID of the movie.
     *
     * @return the ID of the movie
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the movie.
     *
     * @param id the ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the title of the movie.
     *
     * @return the title of the movie
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the title of the movie.
     *
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Gets the synopsis of the movie.
     *
     * @return the synopsis of the movie
     */
    public String getSynopsis() {
        return synopsis;
    }

    /**
     * Sets the synopsis of the movie.
     *
     * @param synopsis the synopsis to set
     */
    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    /**
     * Gets the duration of the movie.
     *
     * @return the duration of the movie
     */
    public int getDuration() {
        return duration;
    }

    /**
     * Sets the duration of the movie.
     *
     * @param duration the duration to set
     */
    public void setDuration(int duration) {
        this.duration = duration;
    }

    /**
     * Gets the genre of the movie.
     *
     * @return the genre of the movie
     */
    public Genre getGenre() {
        return genre;
    }

    /**
     * Sets the genre of the movie.
     *
     * @param genre the genre to set
     */
    public void setGenre(Genre genre) {
        this.genre = genre;
    }

    /**
     * Gets the actors of the movie.
     *
     * @return the actors of the movie
     */
    public Set<Actor> getActors() {
        return actors;
    }

    /**
     * Sets the actors of the movie.
     *
     * @param actors the actors to set
     */
    public void setActors(Set<Actor> actors) {
        this.actors = actors;
    }

    /**
     * Gets the directors of the movie.
     *
     * @return the directors of the movie
     */
    public Set<Director> getDirectors() {
        return directors;
    }

    /**
     * Sets the directors of the movie.
     *
     * @param directors the directors to set
     */
    public void setDirectors(Set<Director> directors) {
        this.directors = directors;
    }
}