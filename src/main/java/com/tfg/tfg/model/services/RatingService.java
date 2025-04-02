package com.tfg.tfg.model.services;

import java.util.List;

import com.tfg.tfg.model.entities.Rating;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.InvalidRatingException;
import com.tfg.tfg.model.services.exceptions.NoRatingsException;

/**
 * Service for managing movie ratings.
 */
public interface RatingService {
    
    /**
     * Adds or updates a movie rating by a user.
     *
     * @param userId      ID of the user making the rating
     * @param imdbId     IMDB ID of the movie being rated
     * @param ratingValue Rating value (0-10)
     * @return The created/updated Rating entity
     * @throws InstanceNotFoundException if the user or movie doesn't exist
     * @throws InvalidRatingException if the rating is outside the allowed range (0-10)
     */
    Rating rateMovie(Long userId, String imdbId, Float ratingValue) 
            throws InstanceNotFoundException, InvalidRatingException;
    
    /**
     * Gets a user's rating for a specific movie.
     *
     * @param userId  ID of the user
     * @param imdbId IMDB ID of the movie
     * @return The associated Rating entity, or null if it doesn't exist
     * @throws InstanceNotFoundException if the user or movie doesn't exist
     */
    Rating getUserRatingForMovie(String imdbId, Long movieId) 
            throws InstanceNotFoundException;
    
    /**
     * Gets the average rating for a movie.
     *
     * @param imdbId IMDB ID of the movie
     * @return Average rating of the movie, or null if it has no ratings
     * @throws InstanceNotFoundException if the movie doesn't exist
     * @throws NoRatingsException if the movie has no ratings
     */
    float getAverageRatingForMovie(String imdbId) throws InstanceNotFoundException, NoRatingsException;
    
    /**
     * Gets all ratings made by a user.
     *
     * @param userId ID of the user
     * @return List of ratings made by the user
     * @throws InstanceNotFoundException if the user doesn't exist
     */
    List<Rating> getUserRatings(Long userId) throws InstanceNotFoundException;
    
    /**
     * Gets all ratings for a movie.
     *
     * @param imdbId IMDB ID of the movie
     * @return List of movie ratings
     * @throws InstanceNotFoundException if the movie doesn't exist
     */
    List<Rating> getMovieRatings(String imdbId) throws InstanceNotFoundException;
    
    /**
     * Deletes a user's rating for a movie.
     *
     * @param userId  ID of the user
     * @param imdbId IMDB ID of the movie
     * @throws InstanceNotFoundException if the user, movie, or rating doesn't exist
     */
    void deleteRating(Long userId, String imdbId) throws InstanceNotFoundException;
}