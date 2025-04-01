package com.tfg.tfg.rest.controllers;

import com.tfg.tfg.model.entities.Rating;
import com.tfg.tfg.model.services.RatingService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.InvalidRatingException;
import com.tfg.tfg.model.services.exceptions.NoRatingsException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.RatingConversor;
import com.tfg.tfg.rest.dtos.RatingDto;

import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/ratings")
public class RatingController {

    private final RatingService ratingService;

    private final MessageSource messageSource;
    
    public RatingController(RatingService ratingService, MessageSource messageSource) {
        this.messageSource = messageSource;
        this.ratingService = ratingService;
    }

    @ExceptionHandler(InvalidRatingException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleInvalidRatingException(InvalidRatingException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
            "project.exceptions.InvalidRatingException", 
            new Object[] {}, 
            exception.getMessage(), locale);
        
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(NoRatingsException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleNoRatingsException(NoRatingsException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
            "project.exceptions.NoRatingsException", 
            new Object[] {}, 
            exception.getMessage(), locale);
        
        return new ErrorsDto(errorMessage);
    }

    @PostMapping("/{userId}/{movieId}")
    @ResponseStatus(HttpStatus.CREATED)
    public RatingDto rateMovie(
            @PathVariable Long userId,
            @PathVariable Long movieId,
            @RequestParam Float value) throws InstanceNotFoundException, InvalidRatingException {
        
        return RatingConversor.toRatingDto(ratingService.rateMovie(userId, movieId, value));
    }

    @GetMapping("/{userId}/{movieId}")
    public RatingDto getUserRatingForMovie(
            @PathVariable Long userId, 
            @PathVariable Long movieId) throws InstanceNotFoundException {
        
        return RatingConversor.toRatingDto(ratingService.getUserRatingForMovie(userId, movieId));
    }

    @GetMapping("/movie/{movieId}/average")
    public Float getAverageRatingForMovie(
            @PathVariable Long movieId) throws InstanceNotFoundException, NoRatingsException {
        
        return ratingService.getAverageRatingForMovie(movieId);

    }

    @GetMapping("/user/{userId}")
    public List<RatingDto> getUserRatings(
            @PathVariable Long userId) throws InstanceNotFoundException {
        
        return RatingConversor.toRatingDtos(ratingService.getUserRatings(userId));
    }

    @GetMapping("/movie/{movieId}")
    public List<RatingDto> getMovieRatings(
            @PathVariable Long movieId) throws InstanceNotFoundException {
        
        return RatingConversor.toRatingDtos(ratingService.getMovieRatings(movieId));
    }

    @DeleteMapping("/{userId}/{movieId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRating(
            @PathVariable Long userId, 
            @PathVariable Long movieId) throws InstanceNotFoundException {
        
        ratingService.deleteRating(userId, movieId);
    }
}