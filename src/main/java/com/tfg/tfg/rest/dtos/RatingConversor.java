package com.tfg.tfg.rest.dtos;

import java.util.List;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.Rating;
import com.tfg.tfg.model.entities.Users;

/**
 * Conversor for Rating entities and DTOs
 */
public class RatingConversor {

    private RatingConversor() {}
    
    /**
     * Converts a Rating entity to a RatingDto
     * 
     * @param rating the Rating entity to convert
     * @return the resulting RatingDto
     */
    public static RatingDto toRatingDto(Rating rating) {
        if (rating == null) return null;
        
        RatingDto dto = new RatingDto();
        dto.setUserId(rating.getUser().getId());
        dto.setMovieId(rating.getMovie().getId());
        dto.setRating(rating.getRating());
        
        return dto;
    }
    
    /**
     * Converts a list of Rating entities to a list of RatingDtos
     * 
     * @param ratings the list of Rating entities to convert
     * @return the resulting list of RatingDtos
     */
    public static List<RatingDto> toRatingDtos(List<Rating> ratings) {
        if (ratings == null) return List.of();
        
        return ratings.stream()
            .map(RatingConversor::toRatingDto)
            .toList();
    }
    
    /**
     * Creates a new Rating entity from the provided data
     * 
     * @param ratingValue the rating value
     * @param user the User entity
     * @param movie the Movie entity
     * @return the resulting Rating entity
     */
    public static Rating toRating(float ratingValue, Users user, Movie movie) {
        Rating rating = new Rating();
        rating.setUser(user);
        rating.setMovie(movie);
        rating.setRating(ratingValue);
        return rating;
    }
    
    /**
     * Updates an existing Rating entity with new values
     * 
     * @param rating the existing Rating entity
     * @param ratingValue the new rating value
     * @return the updated Rating entity
     */
    public static Rating updateRating(Rating rating, float ratingValue) {
        rating.setRating(ratingValue);
        return rating;
    }
}