package com.tfg.tfg.rest.dtos;

public class ReviewVoteDto {
    
    private Long reviewId;
    private Long userId;
    private boolean helpful;
    
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
    
    public boolean isHelpful() {
        return helpful;
    }
    
    public void setHelpful(boolean helpful) {
        this.helpful = helpful;
    }
}