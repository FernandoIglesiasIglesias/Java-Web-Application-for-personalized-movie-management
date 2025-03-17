package com.tfg.tfg.model.entities;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

/**
 * Represents a Movie entity in the system.
 */
@Entity
@Table(name = "Movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imbdId;
    private String title;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;
    private int releaseYear;
    
    @Column(name = "verticalPoster", length = 600)
    private String verticalPoster;
    private int runtime;

    @JsonManagedReference
    @ManyToMany
    @JoinTable(
        name = "MovieGenres",
        joinColumns = @JoinColumn(name = "movieId"),
        inverseJoinColumns = @JoinColumn(name = "genreId")
    )
    private List<Genre> genres;

    @JsonManagedReference
    @ManyToMany
    @JoinTable(
        name = "MovieActors",
        joinColumns = @JoinColumn(name = "movieId"),
        inverseJoinColumns = @JoinColumn(name = "actorId")
    )
    private List<Actor> actors;

    @JsonManagedReference
    @ManyToMany
    @JoinTable(
        name = "MovieDirectors",
        joinColumns = @JoinColumn(name = "movieId"),
        inverseJoinColumns = @JoinColumn(name = "directorId")
    )
    private List<Director> directors;

    /**
     * Default constructor.
     */
    public Movie() {}

    /**
     * Parameterized constructor to create a Movie with the specified details.
     *
     * @param imbdId the imbdId of the movie
     * @param title the title of the movie
     * @param overview the overview of the movie
     * @param releaseYear the release year of the movie
     * @param verticalPoster the vertical poster of the movie
     * @param runtime the runtime of the movie
     * @param genres the genres of the movie
     * @param actors the actors of the movie
     * @param directors the directors of the movie
     */
    public Movie(String imbdId, String title, String overview, int releaseYear, String verticalPoster, int runtime, List<Genre> genres, List<Actor> actors, List<Director> directors) {
        this.imbdId = imbdId;
        this.title = title;
        this.overview = overview;
        this.releaseYear = releaseYear;
        this.verticalPoster = verticalPoster;
        this.runtime = runtime;
        this.genres = genres;
        this.actors = actors;
        this.directors = directors;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImbdId() {
        return imbdId;
    }

    public void setImbdId(String imbdId) {
        this.imbdId = imbdId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOverview() {
        return overview;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public int getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(int releaseYear) {
        this.releaseYear = releaseYear;
    }

    public String getVerticalPoster() {
        return verticalPoster;
    }

    public void setVerticalPoster(String verticalPoster) {
        this.verticalPoster = verticalPoster;
    }

    public int getRuntime() {
        return runtime;
    }

    public void setRuntime(int runtime) {
        this.runtime = runtime;
    }

    public List<Genre> getGenres() {
        return genres;
    }

    public void setGenres(List<Genre> genres) {
        this.genres = genres;
    }

    public List<Actor> getActors() {
        return actors;
    }

    public void setActors(List<Actor> actors) {
        this.actors = actors;
    }

    public void addActor(Actor actor) {
        this.actors.add(actor);
    }

    public List<Director> getDirectors() {
        return directors;
    }

    public void setDirectors(List<Director> directors) {
        this.directors = directors;
    }

    public void addDirector(Director director) {
        this.directors.add(director);
    }
}
