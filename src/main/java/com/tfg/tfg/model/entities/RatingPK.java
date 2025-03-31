package com.tfg.tfg.model.entities;

import java.io.Serializable;
import java.util.Objects;

public class RatingPK implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Users user;
    private Movie movie;

    public RatingPK() {}

    public RatingPK(Users user, Movie movie) {
        this.user = user;
        this.movie = movie;
    }

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RatingPK ratingPK = (RatingPK) o;
        return Objects.equals(user, ratingPK.user) &&
               Objects.equals(movie, ratingPK.movie);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, movie);
    }
}