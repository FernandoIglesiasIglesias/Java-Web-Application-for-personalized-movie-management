package com.tfg.tfg.rest.controllers;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.services.RatingService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.InvalidRatingException;
import com.tfg.tfg.model.services.exceptions.NoRatingsException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.MovieConversor;
import com.tfg.tfg.rest.dtos.MovieDto;
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
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ErrorsDto handleNoRatingsException(NoRatingsException exception, Locale locale) {
        return null;
    }

    @PostMapping("/{userId}/{imdbId}")
    @ResponseStatus(HttpStatus.CREATED)
    public RatingDto rateMovie(
            @PathVariable Long userId,
            @PathVariable String imdbId,
            @RequestParam Float value) throws InstanceNotFoundException, InvalidRatingException {
        
        return RatingConversor.toRatingDto(ratingService.rateMovie(userId, imdbId, value));
    }

    @GetMapping("/{userId}/{imdbId}")
    public RatingDto getUserRatingForMovie(
            @PathVariable Long userId, 
            @PathVariable String imdbId) throws InstanceNotFoundException {
        
        return RatingConversor.toRatingDto(ratingService.getUserRatingForMovie(imdbId, userId));
    }

    @GetMapping("/movie/{imdbId}/average")
    public Float getAverageRatingForMovie(
            @PathVariable String imdbId) throws InstanceNotFoundException, NoRatingsException {
        
        return ratingService.getAverageRatingForMovie(imdbId);
    }

    @GetMapping("/user/{userId}")
    public List<RatingDto> getUserRatings(
            @PathVariable Long userId) throws InstanceNotFoundException {
        
        return RatingConversor.toRatingDtos(ratingService.getUserRatings(userId));
    }

    @GetMapping("/movie/{imdbId}")
    public List<RatingDto> getMovieRatings(
            @PathVariable String imdbId) throws InstanceNotFoundException {
        
        return RatingConversor.toRatingDtos(ratingService.getMovieRatings(imdbId));
    }

    @DeleteMapping("/{userId}/{imdbId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRating(
            @PathVariable Long userId, 
            @PathVariable String imdbId) throws InstanceNotFoundException {
        
        ratingService.deleteRating(userId, imdbId);
    }

    @GetMapping("/topRated")
    public List<MovieDto> getTopRatedMovies(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "0") int page) {
        
        List<Movie> movies = ratingService.getTopRatedMovies(genre, year, pageSize, page);
        return MovieConversor.toMovieDtos(movies);
    }
}