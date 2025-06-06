package com.tfg.tfg.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewVoteDao extends JpaRepository<ReviewVote, ReviewVotePK> {
    
    Optional<ReviewVote> findByReviewIdAndUserId(Long reviewId, Long userId);
    
    void deleteByReviewIdAndUserId(Long reviewId, Long userId);

    void deleteByUserId(Long userId);
}