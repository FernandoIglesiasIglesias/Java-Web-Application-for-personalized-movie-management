package com.tfg.tfg.rest.dtos;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import com.tfg.tfg.model.entities.MovieReview;
import com.tfg.tfg.model.entities.ReviewVote;
import com.tfg.tfg.model.entities.ReviewVoteDao;
import com.tfg.tfg.model.services.MovieReviewService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

public class MovieReviewConversor {
    
    private static DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    private MovieReviewConversor() {}
    
    public static MovieReviewDto toMovieReviewDto(MovieReview review) {
        if (review == null) {
            return null;
        }
        
        MovieReviewDto dto = new MovieReviewDto();
        
        dto.setId(review.getId());
        dto.setTitle(review.getTitle());
        dto.setContent(review.getContent());
        
        if (review.getUser() != null) {
            dto.setUserId(review.getUser().getId());
            dto.setUserName(review.getUser().getUserName());
            dto.setUserAvatar(review.getUser().getAvatar());
        }
        
        if (review.getMovie() != null) {
            dto.setMovieId(review.getMovie().getId());
            dto.setMovieImdbId(review.getMovie().getImdbId());
            dto.setMovieTitle(review.getMovie().getTitle());
            dto.setMoviePoster(review.getMovie().getVerticalPoster());
        }
        
        if (review.getCreatedAt() != null) {
            dto.setCreatedAt(review.getCreatedAt().format(formatter));
        }
        
        // Por defecto, sin datos de votos
        dto.setHelpfulVotes(0L);
        dto.setUnhelpfulVotes(0L);
        dto.setUserVoted(false);
        dto.setUserVotedHelpful(null);
        
        return dto;
    }
    
    public static MovieReviewDto toMovieReviewDtoWithVotes(MovieReview review, Long userId, 
            MovieReviewService reviewService, ReviewVoteDao reviewVoteDao) {
        
        MovieReviewDto dto = toMovieReviewDto(review);
        if (dto == null) {
            return null;
        }
        
        try {
            // Agregar información de votos
            if (reviewService != null) {
                dto.setHelpfulVotes(reviewService.getHelpfulVotesCount(review.getId()));
                dto.setUnhelpfulVotes(reviewService.getUnhelpfulVotesCount(review.getId()));
            }
            
            // Verificar si el usuario actual ha votado esta reseña
            if (userId != null && reviewVoteDao != null) {
                Optional<ReviewVote> vote = reviewVoteDao.findByReviewIdAndUserId(review.getId(), userId);
                dto.setUserVoted(vote.isPresent());
                if (vote.isPresent()) {
                    dto.setUserVotedHelpful(vote.get().isHelpful());
                }
            }
        } catch (InstanceNotFoundException e) {
            // Si hay algún error, mantener los valores predeterminados
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
    
    public static List<MovieReviewDto> toMovieReviewDtosWithVotes(List<MovieReview> reviews, Long userId,
            MovieReviewService reviewService, ReviewVoteDao reviewVoteDao) {
        
        if (reviews == null) {
            return List.of();
        }
        
        return reviews.stream()
            .map(review -> toMovieReviewDtoWithVotes(review, userId, reviewService, reviewVoteDao))
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