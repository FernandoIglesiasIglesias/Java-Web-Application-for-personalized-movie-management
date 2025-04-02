package com.tfg.tfg.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieReviewDao extends JpaRepository<MovieReview, Long> {
    
    List<MovieReview> findByMovieIdOrderByCreatedAtDesc(Long movieId);
    
    List<MovieReview> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<MovieReview> findByUserIdAndMovieId(Long userId, Long movieId);
    
    @Query("SELECT COUNT(rv) FROM ReviewVote rv WHERE rv.review.id = :reviewId AND rv.isHelpful = true")
    Long countHelpfulVotes(@Param("reviewId") Long reviewId);
    
    @Query("SELECT COUNT(rv) FROM ReviewVote rv WHERE rv.review.id = :reviewId AND rv.isHelpful = false")
    Long countUnhelpfulVotes(@Param("reviewId") Long reviewId);
}