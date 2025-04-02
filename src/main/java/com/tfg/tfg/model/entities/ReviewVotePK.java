package com.tfg.tfg.model.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class ReviewVotePK implements Serializable {
    
    private Long reviewId;
    private Long userId;
    
    public ReviewVotePK() {}
    
    public ReviewVotePK(Long reviewId, Long userId) {
        this.reviewId = reviewId;
        this.userId = userId;
    }
    
    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReviewVotePK that = (ReviewVotePK) o;
        return Objects.equals(reviewId, that.reviewId) && 
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reviewId, userId);
    }
}