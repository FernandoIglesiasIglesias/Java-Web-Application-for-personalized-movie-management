package com.tfg.tfg.model.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "ReviewVotes")
public class ReviewVote {
    
    @EmbeddedId
    private ReviewVotePK id = new ReviewVotePK();
    
    @ManyToOne
    @MapsId("reviewId")
    @JoinColumn(name = "reviewId")
    private MovieReview review;
    
    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "userId")
    private Users user;
    
    @Column(nullable = false)
    private boolean isHelpful;
    
    // Constructors
    public ReviewVote() {}
    
    public ReviewVote(MovieReview review, Users user, boolean isHelpful) {
        this.review = review;
        this.user = user;
        this.isHelpful = isHelpful;
    }
    
    public ReviewVotePK getId() {
        return id;
    }

    public void setId(ReviewVotePK id) {
        this.id = id;
    }

    public MovieReview getReview() {
        return review;
    }

    public void setReview(MovieReview review) {
        this.review = review;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public boolean isHelpful() {
        return isHelpful;
    }

    public void setHelpful(boolean helpful) {
        isHelpful = helpful;
    }
}