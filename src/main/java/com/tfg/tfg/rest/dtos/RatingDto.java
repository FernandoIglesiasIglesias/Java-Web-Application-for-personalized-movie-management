package com.tfg.tfg.rest.dtos;

import com.tfg.tfg.model.entities.Rating;

public class RatingDto {

    private Long userId;
    private Long movieId;
    private int rating;
    private String movieTitle;

    public RatingDto() {}

    public RatingDto(Long userId, Long movieId, int rating) {
        this.userId = userId;
        this.movieId = movieId;
        this.rating = rating;
    }

    public RatingDto(Rating rating) {
        this.userId = rating.getUser().getId();
        this.movieId = rating.getMovie().getId();
        this.rating = rating.getRating();
        this.movieTitle = rating.getMovie().getTitle();
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }
}