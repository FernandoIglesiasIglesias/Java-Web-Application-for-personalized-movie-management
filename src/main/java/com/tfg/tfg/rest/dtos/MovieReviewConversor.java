package com.tfg.tfg.rest.dtos;

import java.time.format.DateTimeFormatter;
import java.util.List;

import com.tfg.tfg.model.entities.MovieReview;
import com.tfg.tfg.model.entities.ReviewVote;

public class MovieReviewConversor {
    
    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    private MovieReviewConversor() {}
    
    public static MovieReviewDto toMovieReviewDto(MovieReview review) {
        if (review == null) {
            return null;
        }
        
        MovieReviewDto dto = new MovieReviewDto();
        
        dto.setId(review.getId());
        
        if (review.getUser() != null) {
            dto.setUserId(review.getUser().getId());
        }
        
        if (review.getMovie() != null) {
            dto.setMovieId(review.getMovie().getId());
            dto.setMovieImdbId(review.getMovie().getImdbId());
        }
        
        dto.setTitle(review.getTitle());
        dto.setContent(review.getContent());
        
        if (review.getCreatedAt() != null) {
            dto.setCreatedAt(review.getCreatedAt().format(formatter));
        }
        
        return dto;
    }
    
    public static List<MovieReviewDto> toMovieReviewDtos(List<MovieReview> reviews) {
        if (reviews == null) {
            return List.of();
        }
        
        return reviews.stream()
            .map(MovieReviewConversor::toMovieReviewDto)
            .toList();
    }
    
    public static ReviewVoteDto toReviewVoteDto(ReviewVote vote) {
        if (vote == null) {
            return null;
        }
        
        ReviewVoteDto dto = new ReviewVoteDto();
        
        if (vote.getReview() != null) {
            dto.setReviewId(vote.getReview().getId());
        }
        
        if (vote.getUser() != null) {
            dto.setUserId(vote.getUser().getId());
        }
        
        dto.setHelpful(vote.isHelpful());
        
        return dto;
    }
    
    public static List<ReviewVoteDto> toReviewVoteDtos(List<ReviewVote> votes) {
        if (votes == null) {
            return List.of();
        }
        
        return votes.stream()
            .map(MovieReviewConversor::toReviewVoteDto)
            .toList();
    }
}