package com.tfg.tfg.model.services;

import com.tfg.tfg.model.entities.MovieReview;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MovieReviewService {
    
    /**
     * Creates a new movie review for a specific movie.
     * 
     * @param userId The ID of the user creating the review
     * @param imdbId The IMDB ID of the movie being reviewed
     * @param title The title of the review
     * @param content The content/text of the review
     * @return The newly created MovieReview
     * @throws InstanceNotFoundException If the user or movie does not exist
     */
    MovieReview createReview(Long userId, String imdbId, String title, String content) throws InstanceNotFoundException;
    
    /**
     * Updates an existing movie review.
     * 
     * @param userId The ID of the user attempting to update the review
     * @param reviewId The ID of the review to update
     * @param title The new title for the review
     * @param content The new content for the review
     * @return The updated MovieReview
     * @throws InstanceNotFoundException If the user or review does not exist
     * @throws PermissionException If the user doesn't have permission to update this review
     */
    MovieReview updateReview(Long userId, Long reviewId, String title, String content) throws InstanceNotFoundException, PermissionException;
    
    /**
     * Deletes a movie review.
     * 
     * @param userId The ID of the user attempting to delete the review
     * @param reviewId The ID of the review to delete
     * @throws InstanceNotFoundException If the user or review does not exist
     * @throws PermissionException If the user doesn't have permission to delete this review
     */
    void deleteReview(Long userId, Long reviewId) throws InstanceNotFoundException, PermissionException;
    
    /**
     * Retrieves all reviews for a specific movie.
     * 
     * @param imdbId The IMDB ID of the movie
     * @return A list of MovieReview objects for the specified movie
     * @throws InstanceNotFoundException If the movie does not exist
     */
    List<MovieReview> getMovieReviews(String imdbId) throws InstanceNotFoundException;
    
    /**
     * Retrieves all reviews created by a specific user.
     * 
     * @param userId The ID of the user
     * @return A list of MovieReview objects created by the specified user
     * @throws InstanceNotFoundException If the user does not exist
     */
    List<MovieReview> getUserReviews(Long userId) throws InstanceNotFoundException;

    /**
     * Records a user's vote on a review indicating whether they found it helpful or not.
     * 
     * @param userId The ID of the user voting
     * @param reviewId The ID of the review being voted on
     * @param isHelpful True if the user found the review helpful, false otherwise
     * @return The MovieReview that was voted on
     * @throws InstanceNotFoundException If the user or review does not exist
     * @throws PermissionException If the user can't vote on this review (e.g., own review)
     */
    MovieReview voteReview(Long userId, Long reviewId, boolean isHelpful) throws InstanceNotFoundException, PermissionException;
    
    /**
     * Removes a user's vote from a review.
     * 
     * @param userId The ID of the user removing their vote
     * @param reviewId The ID of the review to remove the vote from
     * @throws InstanceNotFoundException If the user, review, or vote does not exist
     * @throws PermissionException If the user doesn't have permission to remove the vote
     */
    void removeVote(Long userId, Long reviewId) throws InstanceNotFoundException, PermissionException;
    
    /**
     * Gets the count of helpful votes for a specific review.
     * 
     * @param reviewId The ID of the review
     * @return The number of helpful votes
     * @throws InstanceNotFoundException If the review does not exist
     */
    Long getHelpfulVotesCount(Long reviewId) throws InstanceNotFoundException;

    /**
     * Gets the count of unhelpful votes for a specific review.
     * 
     * @param reviewId The ID of the review
     * @return The number of unhelpful votes
     * @throws InstanceNotFoundException If the review does not exist
     */
    Long getUnhelpfulVotesCount(Long reviewId) throws InstanceNotFoundException;

    /**
     * Retrieves a paginated list of reviews for a specific movie.
     * 
     * @param imdbId The IMDb identifier of the movie for which to retrieve reviews
     * @param pageable Pagination information (page number, size, sorting)
     * @return A Page object containing the movie reviews
     * @throws InstanceNotFoundException If no movie with the given IMDb ID exists
     */
    public Page<MovieReview> getMovieReviewsPaged(String imdbId, Pageable pageable) throws InstanceNotFoundException;
    
}
