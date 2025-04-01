package com.tfg.tfg.model.entities;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@IdClass(RatingPK.class)
@Table(name = "MovieRatings")
public class Rating {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private Users user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movieId")
    private Movie movie;

    @Column(name = "rating")
    private float rating;

    public Rating() {}

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public float getRating() {
        return rating;
    }

    public void setRating(float rating) {
        this.rating = rating;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Rating rating = (Rating) o;
        return Objects.equals(user, rating.user) &&
               Objects.equals(movie, rating.movie);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, movie);
    }

    @Override
    public String toString() {
        return "Rating{" +
               "user=" + user.getId() +
               ", movie=" + movie.getId() +
               ", rating=" + rating +
               '}';
    }
}