package com.tfg.tfg.rest.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tfg.tfg.model.entities.MovieReview;
import com.tfg.tfg.model.entities.ReviewVoteDao;
import com.tfg.tfg.model.services.MovieReviewService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;
import com.tfg.tfg.rest.dtos.MovieReviewConversor;
import com.tfg.tfg.rest.dtos.MovieReviewDto;
import com.tfg.tfg.rest.dtos.ReviewVoteDto;

@RestController
@RequestMapping("/reviews")
public class MovieReviewController {

    private final MovieReviewService movieReviewService;
    private final ReviewVoteDao reviewVoteDao;
        
    public MovieReviewController(MovieReviewService movieReviewService, ReviewVoteDao reviewVoteDao) {
        this.movieReviewService = movieReviewService;
        this.reviewVoteDao = reviewVoteDao;
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovieReviewDto createReview(@RequestAttribute Long userId, 
                                      @RequestBody MovieReviewDto reviewDto) 
            throws InstanceNotFoundException {
        
        MovieReview review = movieReviewService.createReview(
            userId, 
            reviewDto.getMovieImdbId(), 
            reviewDto.getTitle(), 
            reviewDto.getContent()
        );
        
        return MovieReviewConversor.toMovieReviewDtoWithVotes(review, userId, movieReviewService, reviewVoteDao);
    }
    
    @PutMapping("/{id}")
    public MovieReviewDto updateReview(@RequestAttribute Long userId,
                                      @PathVariable Long id,
                                      @RequestBody MovieReviewDto reviewDto) 
            throws InstanceNotFoundException, PermissionException {
        
        MovieReview review = movieReviewService.updateReview(
            userId, 
            id, 
            reviewDto.getTitle(), 
            reviewDto.getContent()
        );
        
        return MovieReviewConversor.toMovieReviewDtoWithVotes(review, userId, movieReviewService, reviewVoteDao);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@RequestAttribute Long userId,
                            @PathVariable Long id) 
            throws InstanceNotFoundException, PermissionException {
        
        movieReviewService.deleteReview(userId, id);
    }
    
    @GetMapping("/movie/{imdbId}")
    public List<MovieReviewDto> getMovieReviews(@RequestAttribute(required = false) Long userId, 
                                               @PathVariable String imdbId) 
            throws InstanceNotFoundException {
        
        return MovieReviewConversor.toMovieReviewDtosWithVotes(
            movieReviewService.getMovieReviews(imdbId),
            userId,
            movieReviewService,
            reviewVoteDao
        );
    }
    
    @GetMapping("/user/{userId}")
    public List<MovieReviewDto> getUserReviews(@PathVariable Long userId) 
            throws InstanceNotFoundException {
        
        return MovieReviewConversor.toMovieReviewDtosWithVotes(
            movieReviewService.getUserReviews(userId),
            userId,
            movieReviewService,
            reviewVoteDao
        );
    }
    
    @PostMapping("/{id}/vote")
    public MovieReviewDto voteReview(@RequestAttribute Long userId,
                                    @PathVariable Long id,
                                    @RequestBody ReviewVoteDto voteDto) 
            throws InstanceNotFoundException, PermissionException {
        
        MovieReview review = movieReviewService.voteReview(userId, id, voteDto.isHelpful());
        
        return MovieReviewConversor.toMovieReviewDtoWithVotes(review, userId, movieReviewService, reviewVoteDao);
    }
    
    @DeleteMapping("/{id}/vote")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeVote(@RequestAttribute Long userId,
                          @PathVariable Long id) 
            throws InstanceNotFoundException, PermissionException {
        
        movieReviewService.removeVote(userId, id);
    }
}