package com.tfg.tfg.rest.controllers;

import com.tfg.tfg.model.entities.Rating;
import com.tfg.tfg.model.services.RatingService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.InvalidRatingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping("/{userId}/{movieId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Rating rateMovie(
            @PathVariable Long userId,
            @PathVariable Long movieId,
            @RequestParam int value) throws InstanceNotFoundException, InvalidRatingException {
        
        return ratingService.rateMovie(userId, movieId, value);
    }

    @GetMapping("/{userId}/{movieId}")
    public Rating getUserRatingForMovie(
            @PathVariable Long userId, 
            @PathVariable Long movieId) throws InstanceNotFoundException {
        
        return ratingService.getUserRatingForMovie(userId, movieId);
    }

    @GetMapping("/movie/{movieId}/average")
    public Double getAverageRatingForMovie(
            @PathVariable Long movieId) throws InstanceNotFoundException {
        
        return ratingService.getAverageRatingForMovie(movieId);
    }

    @GetMapping("/user/{userId}")
    public List<Rating> getUserRatings(
            @PathVariable Long userId) throws InstanceNotFoundException {
        
        return ratingService.getUserRatings(userId);
    }

    @GetMapping("/movie/{movieId}")
    public List<Rating> getMovieRatings(
            @PathVariable Long movieId) throws InstanceNotFoundException {
        
        return ratingService.getMovieRatings(movieId);
    }

    @DeleteMapping("/{userId}/{movieId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRating(
            @PathVariable Long userId, 
            @PathVariable Long movieId) throws InstanceNotFoundException {
        
        ratingService.deleteRating(userId, movieId);
    }
}