package com.tfg.tfg.rest.dtos;

public class RatingDto {

    private Long userId;
    private Long movieId;
    private Float rating;

    public RatingDto() {}

    public RatingDto(Long userId, Long movieId, Float rating) {
        this.userId = userId;
        this.movieId = movieId;
        this.rating = rating;
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

    public Float getRating() {
        return rating;
    }

    public void setRating(Float rating) {
        this.rating = rating;
    }

}